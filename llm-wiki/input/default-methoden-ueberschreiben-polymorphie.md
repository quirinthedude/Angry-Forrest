# Default-Methoden überschreiben – Polymorphie durch Vererbung

## Grundidee

Eine Basisklasse kann eine **Default-Methode** bereitstellen, die für den Normalfall gilt.

Unterklassen können dieselbe Methode mit einer eigenen Implementierung **überschreiben**.

Dadurch kann auf allen Objekten dieselbe Methode aufgerufen werden, obwohl sich ihr Verhalten je nach konkreter Klasse unterscheidet.

Das ist ein typisches Beispiel für **Polymorphie**:

> Gleicher Methodenname, unterschiedliches Verhalten je nach Objekt.

---

## Warum ist das nützlich?

Ohne eine Default-Methode müsste aufrufender Code oft prüfen, um welche Art Objekt es sich handelt.

Zum Beispiel:

```js
if (object instanceof MovableObject) {
  // spezielle Logik
} else {
  // Standardverhalten
}
```

Oder man müsste prüfen, ob eine Methode überhaupt existiert:

```js
if (object.shouldMirror) {
  ...
}
```

Mit einer Default-Methode kann stattdessen garantiert werden:

```js
object.shouldMirror();
```

Jedes passende Objekt besitzt diese Methode.

Die Basisklasse liefert das Standardverhalten, Unterklassen können davon abweichen.

---

## Beispiel aus Angry Forrest

In `World.drawObject()` werden unterschiedliche Arten von Objekten gezeichnet:

- Character
- Gnomes
- Robot
- Background-Objekte
- Sky
- weitere `DrawableObject`s

Nicht jedes Objekt soll gespiegelt werden können.

Darum wäre es ungünstig, wenn `World` selbst wissen müsste, welche Objektklasse beweglich ist.

### 1. Default-Verhalten in `DrawableObject`

`DrawableObject` definiert:

```js
shouldMirror() {
  return false;
}
```

Damit gilt für jedes normale zeichnbare Objekt:

> Standardmäßig wird nicht gespiegelt.

Ein Background-Objekt oder der Himmel muss nichts weiter implementieren.

---

### 2. Überschreiben in `MovableObject`

`MovableObject` erbt von `DrawableObject`, ersetzt aber die Methode durch eine eigene Version:

```js
shouldMirror() {
  return this.direction === 1;
}
```

Damit bedeutet die Methode bei beweglichen Objekten:

> Ob gespiegelt wird, hängt von der aktuellen Richtung ab.

Die Methode aus `DrawableObject` wird für `MovableObject` und dessen Unterklassen dadurch **überschrieben**.

Zum Beispiel erbt auch `Character` diese neue Version.

---

### 3. `World` bleibt generisch

`World.drawObject()` muss nicht mehr wissen, welche konkrete Klasse gerade gezeichnet wird:

```js
if (object.shouldMirror()) {
  this.drawMirroredObject(object);
} else {
  this.ctx.drawImage(
    object.img,
    object.x,
    object.y,
    object.width,
    object.height,
  );
}
```

`World` ruft immer nur auf:

```js
object.shouldMirror()
```

Welche Implementierung tatsächlich ausgeführt wird, hängt vom Objekt ab.

Für ein normales `DrawableObject`:

```js
shouldMirror() {
  return false;
}
```

Für ein `MovableObject`:

```js
shouldMirror() {
  return this.direction === 1;
}
```

---

## Vererbungsweg im Projekt

```text
DrawableObject
│
│ shouldMirror() → false
│
└── MovableObject
    │
    │ shouldMirror() → direction === 1
    │
    ├── Character
    ├── Gnome
    └── Robot
```

`Character`, `Gnome` und `Robot` müssen keine eigene `shouldMirror()`-Methode schreiben, solange ihnen das Verhalten aus `MovableObject` genügt.

Sollte später eine Figur ein Sonderverhalten brauchen, könnte auch sie die Methode erneut überschreiben.

Beispiel:

```js
class SpecialEnemy extends MovableObject {
  shouldMirror() {
    return false;
  }
}
```

Damit würde nur diese Klasse wieder ein anderes Verhalten bekommen.

---

## Wichtiger Unterschied: Überschreiben statt Abfragen

Weniger günstig wäre:

```js
if (object instanceof MovableObject) {
  if (object.direction === 1) {
    ...
  }
}
```

Denn dadurch müsste `World` Details über `MovableObject` kennen.

Mit:

```js
object.shouldMirror()
```

fragt `World` stattdessen nur:

> Soll dieses Objekt gespiegelt werden?

Wie das Objekt diese Entscheidung trifft, bleibt Sache der jeweiligen Klasse.

Das ist ein wichtiger OOP-Grundgedanke:

> Ein Objekt sollte möglichst selbst wissen, wie es sich verhält.

---

## Merksatz

**Basisklasse = sinnvolles Default-Verhalten.**

**Unterklasse = überschreibt nur dann, wenn sie anderes Verhalten braucht.**

Dadurch kann aufrufender Code generisch bleiben und muss weniger über konkrete Klassen wissen.
