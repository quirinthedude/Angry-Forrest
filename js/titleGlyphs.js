/**
 * Bildbasierter Zeichensatz für Titel- und Anleitungstexte.
 *
 * Die Dateipfade sind relativ zu index.html angegeben. Nicht unterstützte
 * Zeichen können vom Renderer als normaler Text dargestellt werden.
 */
const TITLE_GLYPHS = Object.freeze({
  A: "./img/title-glyphs/letters/A.png",
  B: "./img/title-glyphs/letters/B.png",
  C: "./img/title-glyphs/letters/C.png",
  D: "./img/title-glyphs/letters/D.png",
  E: "./img/title-glyphs/letters/E.png",
  F: "./img/title-glyphs/letters/F.png",
  G: "./img/title-glyphs/letters/G.png",
  H: "./img/title-glyphs/letters/H.png",
  I: "./img/title-glyphs/letters/I.png",
  J: "./img/title-glyphs/letters/J.png",
  K: "./img/title-glyphs/letters/K.png",
  L: "./img/title-glyphs/letters/L.png",
  M: "./img/title-glyphs/letters/M.png",
  N: "./img/title-glyphs/letters/N.png",
  O: "./img/title-glyphs/letters/O.png",
  P: "./img/title-glyphs/letters/P.png",
  Q: "./img/title-glyphs/letters/Q.png",
  R: "./img/title-glyphs/letters/R.png",
  S: "./img/title-glyphs/letters/S.png",
  T: "./img/title-glyphs/letters/T.png",
  U: "./img/title-glyphs/letters/U.png",
  V: "./img/title-glyphs/letters/V.png",
  W: "./img/title-glyphs/letters/W.png",
  X: "./img/title-glyphs/letters/X.png",
  Y: "./img/title-glyphs/letters/Y.png",
  Z: "./img/title-glyphs/letters/Z.png",

  0: "./img/title-glyphs/numbers/0.png",
  1: "./img/title-glyphs/numbers/1.png",
  2: "./img/title-glyphs/numbers/2.png",
  3: "./img/title-glyphs/numbers/3.png",
  4: "./img/title-glyphs/numbers/4.png",
  5: "./img/title-glyphs/numbers/5.png",
  6: "./img/title-glyphs/numbers/6.png",
  7: "./img/title-glyphs/numbers/7.png",
  8: "./img/title-glyphs/numbers/8.png",
  9: "./img/title-glyphs/numbers/9.png",

  ".": "./img/title-glyphs/punctuation/period.png",
  ",": "./img/title-glyphs/punctuation/comma.png",
  "!": "./img/title-glyphs/punctuation/exclamation.png",
  "?": "./img/title-glyphs/punctuation/question.png",
  ":": "./img/title-glyphs/punctuation/colon.png",
  "-": "./img/title-glyphs/punctuation/hyphen.png",
  "+": "./img/title-glyphs/punctuation/plus.png",

  ArrowLeft: "./img/title-glyphs/controls/arrow-left.png",
  ArrowRight: "./img/title-glyphs/controls/arrow-right.png",
  ArrowUp: "./img/title-glyphs/controls/arrow-up.png",
  ArrowDown: "./img/title-glyphs/controls/arrow-down.png",
  Enter: "./img/title-glyphs/controls/enter.png",
  Space: "./img/title-glyphs/controls/space.png",
});

const TITLE_GLYPH_ALIASES = Object.freeze({
  "←": "ArrowLeft",
  "→": "ArrowRight",
  "↵": "Enter",
  " ": "Space",
});
