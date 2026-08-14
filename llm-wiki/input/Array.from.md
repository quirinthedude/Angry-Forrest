# `Array.from()` – Arrays deklarativ erzeugen

## Ausgangslage

Für die Walking-Animation eines Characters müssen mehrere Bildpfade erzeugt werden:

```js
/img/character/walk/animation_walk_000.png
/img/character/walk/animation_walk_001.png
/img/character/walk/animation_walk_002.png
...
```

Eine klassische Lösung besteht darin, zunächst ein leeres Array anzulegen und die erzeugten Pfade anschließend mit einer Schleife hineinzuschieben:

```js
function createAnimationImages(path, amount) {
  const images = [];

  for (let i = 0; i < amount; i++) {
    images.push(`${path}${String(i).padStart(3, "0")}.png`);
  }

  return images;
}
```

Das ist gut lesbar und macht die einzelnen Arbeitsschritte deutlich:

1. Array erzeugen
2. Schleife durchlaufen
3. aus dem Index einen Dateinamen erzeugen
4. Dateinamen mit `push()` zum Array hinzufügen
5. fertiges Array zurückgeben

---

## Dieselbe Aufgabe mit `Array.from()`

```js
function createAnimationImages(path, amount) {
  return Array.from(
    { length: amount },
    (_, i) => `${path}${String(i).padStart(3, "0")}.png`,
  );
}
```

`Array.from()` beschreibt stärker das gewünschte Ergebnis:

> Erzeuge ein Array einer bestimmten Länge und berechne für jede Position den entsprechenden Wert.

Es muss also nicht zuerst ein leeres Array erstellt und anschließend verändert werden.

---

## `{ length: amount }`

```js
{
  length: amount;
}
```

beschreibt hier ein Objekt mit einer bestimmten Länge.

Bei:

```js
Array.from({ length: 20 }, ...)
```

wird daraus ein Array mit 20 Positionen.

Die Indizes reichen entsprechend von:

```text
0
1
2
...
19
```

---

## Die Callback-Funktion

Als zweiten Parameter erhält `Array.from()` eine Funktion, die für jeden Eintrag ausgeführt wird.

Sie erhält unter anderem:

```js
(value, index);
```

In unserem Fall benötigen wir den eigentlichen `value` nicht. Wir benötigen nur den Index:

```js
(_, i);
```

Dabei gilt:

```text
_  → value, wird nicht benötigt
i  → index, wird benötigt
```

---

## Was bedeutet `_`?

`_` besitzt hier **keine besondere Bedeutung in JavaScript**.

Es ist ein ganz normaler Variablenname.

Folgendes wäre technisch ebenfalls möglich:

```js
(notInUse, i) => ...
```

oder sogar:

```js
(banana, i) => ...
```

Die Schreibweise `_` ist lediglich eine verbreitete Konvention:

> Dieser Parameter existiert, wird aber absichtlich nicht verwendet.

Wir können ihn nicht einfach weglassen, weil die Reihenfolge der Parameter feststeht.

Das hier:

```js
(i) => ...
```

würde bedeuten:

```text
i = value
```

und **nicht**:

```text
i = index
```

Deshalb schreiben wir:

```js
(_, i) => ...
```

Der erste Parameter wird entgegengenommen und ignoriert, damit wir auf den zweiten Parameter zugreifen können.

---

## `String(i).padStart(3, "0")`

Der Index beginnt als Zahl:

```js
0
1
2
...
```

Für die Dateinamen brauchen wir aber:

```text
000
001
002
...
```

Dazu wird der Index zunächst in einen String umgewandelt:

```js
String(i);
```

und anschließend links mit `"0"` aufgefüllt:

```js
String(i).padStart(3, "0");
```

Beispiele:

```text
0   → "000"
1   → "001"
9   → "009"
10  → "010"
19  → "019"
```

---

## Imperativ vs. deklarativ

Die `for`-Variante beschreibt stärker den **Ablauf**:

```text
Erstelle Array
→ durchlaufe Zahlen
→ erzeuge Wert
→ füge Wert hinzu
→ gib Array zurück
```

`Array.from()` beschreibt stärker das **gewünschte Ergebnis**:

```text
Erzeuge ein Array mit n Elementen,
deren Werte nach dieser Regel berechnet werden.
```

Deshalb kann diese Variante kompakter und ausdrucksstärker sein:

```js
return Array.from(
  { length: amount },
  (_, i) => `${path}${String(i).padStart(3, "0")}.png`,
);
```

Die klassische `for`-Schleife ist deshalb aber nicht schlechter. Besonders beim Lernen oder bei komplexerer Logik kann sie leichter nachvollziehbar sein.

## Merksatz

> `Array.from({ length: n }, (_, i) => ...)` eignet sich, wenn ein neues Array einer bekannten Länge erzeugt werden soll und sich jeder Eintrag aus seinem Index berechnen lässt.
