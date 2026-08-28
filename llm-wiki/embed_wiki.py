#!/usr/bin/env python3
"""Build and query a small local semantic index for llm-wiki Markdown files.

The only runtime dependency is a locally running Ollama instance.  The index is
stored as JSON so the first version stays inspectable and easy to replace later
with a vector database if the wiki grows substantially.
"""

from __future__ import annotations

import argparse
import json
import math
import sys
import urllib.error
import urllib.request
from pathlib import Path


ROOT = Path(__file__).resolve().parent
INPUT_DIR = ROOT / "input"
CODE_DIR = ROOT.parent / "js"
REPO_ROOT = ROOT.parent
INDEX_PATH = ROOT / "index.json"
DEFAULT_MODEL = "qwen3-embedding:latest"
DEFAULT_CHAT_MODEL = "qwen3:8b"
DEFAULT_OLLAMA_URL = "http://127.0.0.1:11434"


def read_chunks(max_chars: int = 1800, include_code: bool = True) -> list[dict[str, str | int]]:
    """Split Markdown files into heading-aware, bounded text chunks."""
    chunks: list[dict[str, str | int]] = []

    for path in sorted(INPUT_DIR.glob("*.md")):
        lines = path.read_text(encoding="utf-8").splitlines()
        sections: list[str] = []
        current: list[str] = []

        for line in lines:
            if line.startswith("#") and current:
                sections.append("\n".join(current).strip())
                current = []
            current.append(line)
        if current:
            sections.append("\n".join(current).strip())

        file_chunk_index = 0
        for section in sections:
            if not section:
                continue
            paragraphs = section.split("\n\n")
            current_text = ""
            for paragraph in paragraphs:
                paragraph = paragraph.strip()
                if not paragraph:
                    continue
                candidate = f"{current_text}\n\n{paragraph}" if current_text else paragraph
                if current_text and len(candidate) > max_chars:
                    chunks.append(
                        {
                            "source": str(path.relative_to(REPO_ROOT)),
                            "kind": "wiki",
                            "chunk_index": file_chunk_index,
                            "text": current_text,
                        }
                    )
                    file_chunk_index += 1
                    current_text = paragraph
                else:
                    current_text = candidate
            if current_text:
                chunks.append(
                    {
                        "source": str(path.relative_to(REPO_ROOT)),
                        "kind": "wiki",
                        "chunk_index": file_chunk_index,
                        "text": current_text,
                    }
                )
                file_chunk_index += 1

    if include_code:
        for path in sorted(CODE_DIR.rglob("*.js")):
            lines = path.read_text(encoding="utf-8").splitlines()
            chunk_index = 0
            current_lines: list[str] = []
            start_line = 1
            for line_number, line in enumerate(lines, start=1):
                if current_lines and len("\n".join(current_lines + [line])) > max_chars:
                    chunks.append(
                        {
                            "source": str(path.relative_to(REPO_ROOT)),
                            "kind": "code",
                            "chunk_index": chunk_index,
                            "line_start": start_line,
                            "line_end": line_number - 1,
                            "text": "\n".join(current_lines),
                        }
                    )
                    chunk_index += 1
                    current_lines = []
                    start_line = line_number
                current_lines.append(line)
            if current_lines:
                chunks.append(
                    {
                        "source": str(path.relative_to(REPO_ROOT)),
                        "kind": "code",
                        "chunk_index": chunk_index,
                        "line_start": start_line,
                        "line_end": len(lines),
                        "text": "\n".join(current_lines),
                    }
                )

    return chunks


def post_json(url: str, payload: dict, timeout: int = 180) -> dict:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Ollama returned HTTP {error.code}: {detail}") from error
    except urllib.error.URLError as error:
        raise RuntimeError(f"Cannot reach Ollama at {url}: {error.reason}") from error


def embed(texts: list[str], model: str, ollama_url: str) -> list[list[float]]:
    response = post_json(
        f"{ollama_url.rstrip('/')}/api/embed",
        {"model": model, "input": texts},
    )
    embeddings = response.get("embeddings")
    if not isinstance(embeddings, list) or len(embeddings) != len(texts):
        raise RuntimeError(f"Unexpected embedding response: expected {len(texts)} vectors")
    return embeddings


def build_index(model: str, ollama_url: str, max_chars: int, batch_size: int, include_code: bool) -> None:
    chunks = read_chunks(max_chars=max_chars, include_code=include_code)
    if not chunks:
        raise RuntimeError(f"No Markdown files found in {INPUT_DIR}")

    vectors: list[list[float]] = []
    for start in range(0, len(chunks), batch_size):
        batch = chunks[start : start + batch_size]
        print(f"Embedding chunks {start + 1}-{start + len(batch)} of {len(chunks)}...", file=sys.stderr)
        vectors.extend(embed([str(chunk["text"]) for chunk in batch], model, ollama_url))

    index = {
        "format": 1,
        "model": model,
        "include_code": include_code,
        "dimensions": len(vectors[0]),
        "chunks": [{**chunk, "embedding": vector} for chunk, vector in zip(chunks, vectors)],
    }
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False), encoding="utf-8")
    print(f"Built {len(chunks)} chunks from {len({c['source'] for c in chunks})} files")
    print(f"Index: {INDEX_PATH}")
    print(f"Dimensions: {index['dimensions']}")


def cosine_similarity(left: list[float], right: list[float]) -> float:
    dot = sum(a * b for a, b in zip(left, right))
    left_norm = math.sqrt(sum(value * value for value in left))
    right_norm = math.sqrt(sum(value * value for value in right))
    return dot / (left_norm * right_norm) if left_norm and right_norm else 0.0


def rank_chunks(
    query: str,
    model: str,
    ollama_url: str,
    top_k: int,
    scope: str,
) -> list[tuple[float, dict]]:
    if not INDEX_PATH.exists():
        raise RuntimeError(f"Missing {INDEX_PATH}; run the build command first")
    index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    if index["model"] != model:
        raise RuntimeError(f"Index uses {index['model']!r}; query requested {model!r}. Rebuild first.")
    if scope not in {"wiki", "code", "all"}:
        raise RuntimeError(f"Unknown scope {scope!r}; use wiki, code or all")
    chunks = index["chunks"] if scope == "all" else [
        chunk for chunk in index["chunks"] if chunk.get("kind", "wiki") == scope
    ]
    if not chunks:
        raise RuntimeError(
            "No chunks available for scope 'code'; rebuild without '--exclude-code' first"
        )

    query_vector = embed([query], model, ollama_url)[0]
    ranked = sorted(
        [
            (cosine_similarity(query_vector, chunk["embedding"]), chunk)
            for chunk in chunks
        ],
        key=lambda item: item[0],
        reverse=True,
    )
    return ranked[:top_k]


def search(query: str, model: str, ollama_url: str, top_k: int, scope: str) -> None:
    for score, chunk in rank_chunks(query, model, ollama_url, top_k, scope):
        result = {
            key: value
            for key, value in chunk.items()
            if key != "embedding"
        }
        print(json.dumps({"score": round(score, 6), **result}, ensure_ascii=False))


def chat(messages: list[dict[str, str]], model: str, ollama_url: str) -> str:
    response = post_json(
        f"{ollama_url.rstrip('/')}/api/chat",
        {"model": model, "messages": messages, "stream": False},
    )
    message = response.get("message", {})
    content = message.get("content") if isinstance(message, dict) else None
    if not isinstance(content, str) or not content.strip():
        raise RuntimeError("Unexpected chat response from Ollama")
    return content.strip()


def ask(
    query: str,
    embedding_model: str,
    chat_model: str,
    ollama_url: str,
    top_k: int,
    scope: str,
) -> None:
    ranked = rank_chunks(query, embedding_model, ollama_url, top_k, scope)
    context = "\n\n".join(
        f"[Quelle: {chunk['source']}, Chunk {chunk['chunk_index']}]\n{chunk['text']}"
        for _, chunk in ranked
    )
    messages = [
        {
            "role": "system",
            "content": (
                "Du beantwortest Fragen ausschließlich anhand des bereitgestellten "
                "llm-wiki-Kontexts. Antworte auf Deutsch und präzise. Wenn der "
                "Kontext die Frage nicht ausreichend beantwortet, sage das offen "
                "und erfinde keine Projektdetails. Antworte ohne Quellenliste, "
                "Links oder Chunk-Nummern; das Programm ergänzt die Quellenliste "
                "nach deiner Antwort."
            ),
        },
        {
            "role": "user",
            "content": f"Frage:\n{query}\n\nllm-wiki-Kontext:\n{context}",
        },
    ]
    answer = chat(messages, chat_model, ollama_url)
    print(answer)
    print("\nQuellen:")
    for score, chunk in ranked:
        print(f"- {chunk['source']} (score={score:.4f}, chunk={chunk['chunk_index']})")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", default=DEFAULT_MODEL)
    parser.add_argument("--ollama-url", default=DEFAULT_OLLAMA_URL)
    subparsers = parser.add_subparsers(dest="command", required=True)

    build = subparsers.add_parser("build", help="embed Wiki input files and JavaScript code")
    build.add_argument("--max-chars", type=int, default=1800)
    build.add_argument("--batch-size", type=int, default=8)
    build.add_argument(
        "--exclude-code",
        action="store_false",
        dest="include_code",
        help="exclude JavaScript files from js/ (code is included by default)",
    )
    build.set_defaults(include_code=True)

    query = subparsers.add_parser("search", help="search the local embedding index")
    query.add_argument("query")
    query.add_argument("--top-k", type=int, default=3)
    query.add_argument("--scope", choices=("wiki", "code", "all"), default="all")

    ask_parser = subparsers.add_parser("ask", help="answer a question using retrieved wiki context")
    ask_parser.add_argument("query")
    ask_parser.add_argument("--top-k", type=int, default=4)
    ask_parser.add_argument("--chat-model", default=DEFAULT_CHAT_MODEL)
    ask_parser.add_argument("--scope", choices=("wiki", "code", "all"), default="all")

    args = parser.parse_args()
    try:
        if args.command == "build":
            build_index(args.model, args.ollama_url, args.max_chars, args.batch_size, args.include_code)
        elif args.command == "search":
            search(args.query, args.model, args.ollama_url, args.top_k, args.scope)
        else:
            ask(args.query, args.model, args.chat_model, args.ollama_url, args.top_k, args.scope)
    except RuntimeError as error:
        print(f"error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
