# Lokale semantische Suche

`embed_wiki.py` erzeugt aus den Markdown-Dateien in `input/` einen lokalen
Embedding-Index. Als Embedding-Modell wird standardmäßig das lokal installierte
Ollama-Modell `qwen3-embedding:latest` verwendet.

## Index bauen

Ollama muss laufen und das Modell muss vorhanden sein:

```bash
python3 llm-wiki/embed_wiki.py build
```

Der Index wird als `llm-wiki/index.json` gespeichert. Er enthält standardmäßig
pro Wiki- und JavaScript-Chunk die Quelldatei, den Text und den
Embedding-Vektor. Dadurch ist die erste Version leicht inspizierbar und
benötigt keine externe Datenbank.

Falls ausnahmsweise nur die Markdown-Dateien eingebettet werden sollen:

```bash
python3 llm-wiki/embed_wiki.py build --exclude-code
```

## Semantisch suchen

```bash
python3 llm-wiki/embed_wiki.py search "Wie bekommt ein Gegner Zugriff auf die World?"
```

Die Ergebnisse werden als JSON-Zeilen mit Ähnlichkeitswert, Quelle und Text
ausgegeben. Nach Änderungen an den Markdown-Dateien muss der Index mit `build`
neu erzeugt werden.

## Frage mit lokaler Antwortgenerierung

`ask` kombiniert die semantische Suche mit einem lokalen Ollama-Chatmodell:

```bash
python3 llm-wiki/embed_wiki.py ask \
  "Wie bekommt ein Gegner Zugriff auf die World und den Character?" \
  --scope all
```

Standardmäßig wird dafür `qwen3:8b` verwendet. Die Antwort erhält nur die
gefundenen Wiki-Chunks als Kontext und gibt anschließend die verwendeten
Quelldateien aus. Das Modell arbeitet dabei ohne externe Websuche.

Ein anderes lokales Chatmodell kann so gewählt werden:

```bash
python3 llm-wiki/embed_wiki.py ask \
  "Wie funktioniert die Zeichenschleife?" \
  --chat-model qwen2.5-coder:3b --top-k 5
```

Optionen:

```bash
python3 llm-wiki/embed_wiki.py \
  --model qwen3-embedding:latest \
  --ollama-url http://127.0.0.1:11434 \
  search "Wie funktioniert requestAnimationFrame?" --top-k 5
```

Der Suchbereich kann mit `--scope wiki`, `--scope code` oder `--scope all`
eingeschränkt werden. Für `code` und `all` mit Code-Treffern muss der Index
zuvor ohne `--exclude-code` erzeugt worden sein.
