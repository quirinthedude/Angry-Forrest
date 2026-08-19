# JavaScript OOP: Methode oder Helper-Funktion?

## Ausgangsfrage

Im Projekt **Angry Forrest** soll berechnet werden, wie viele Tiles eine Parallax-Ebene benötigt.

Eine mögliche Methode in `Landscape` wäre:

```js
getTileCount(parallaxFactor) {
  return Math.ceil(
    (this.levelLength * parallaxFactor + 720) / this.tileWidth
  );
}
```

Die Frage ist:

> Gehört diese Logik als Methode in die Klasse `Landscape` oder als allgemeine Helper-Funktion in `helpers.js`?

## Faustregel

> **Wenn eine Funktion hauptsächlich mit dem Zustand eines bestimmten Objekts arbeitet, ist sie meist eine Methode.**

> **Wenn sie nur Eingaben verarbeitet und unabhängig von einer bestimmten Klasse überall verwendet werden kann, ist sie eher eine Helper-Funktion.**

## Warum `getTileCount()` gut zu `Landscape` passt

Die Berechnung benötigt hauptsächlich Werte, die bereits zur Landscape gehören:

```js
this.levelLength
this.tileWidth
```

Zusätzlich kommt nur der konkrete Parallax-Faktor hinein:

```js
parallaxFactor
```

Die Methode beantwortet damit eine fachliche Frage über das aktuelle Objekt:

> Wie viele Tiles braucht **diese Landscape** für einen bestimmten Parallax-Faktor?

Darum ist diese Form passend:

```js
class Landscape {
  tileWidth = 865;
  levelLength = 4325;

  getTileCount(parallaxFactor) {
    return Math.ceil(
      (this.levelLength * parallaxFactor + 720) / this.tileWidth
    );
  }
}
```

Verwendung:

```js
this.getTileCount(0.8);
```

Die Methode kann direkt auf die Eigenschaften ihrer eigenen Instanz zugreifen.

## Wie dieselbe Logik als Helper aussehen würde

Als allgemeine Helper-Funktion müsste jeder benötigte Wert ausdrücklich übergeben werden:

```js
function calculateTileCount(
  levelLength,
  parallaxFactor,
  canvasWidth,
  tileWidth
) {
  return Math.ceil(
    (levelLength * parallaxFactor + canvasWidth) / tileWidth
  );
}
```

Der Aufruf wäre dann beispielsweise:

```js
calculateTileCount(
  this.levelLength,
  0.8,
  720,
  this.tileWidth
);
```

Diese Funktion ist unabhängiger. Sie weiß nichts über `Landscape`, `World` oder irgendeine andere Klasse.

## Vergleich

### Methode

```js
class Landscape {
  getTileCount(parallaxFactor) {
    return Math.ceil(
      (this.levelLength * parallaxFactor + 720) / this.tileWidth
    );
  }
}
```

Vorteile:

- gehört fachlich direkt zur Landscape
- nutzt vorhandenen Objektzustand über `this`
- weniger Parameter notwendig
- der Aufruf beschreibt klar, welches Objekt gemeint ist

```js
landscape.getTileCount(0.8);
```

### Helper

```js
function calculateTileCount(
  levelLength,
  parallaxFactor,
  canvasWidth,
  tileWidth
) {
  return Math.ceil(
    (levelLength * parallaxFactor + canvasWidth) / tileWidth
  );
}
```

Vorteile:

- vollständig unabhängig von Klassen
- leicht an unterschiedlichen Stellen wiederverwendbar
- bekommt alle Abhängigkeiten explizit als Parameter

## Entscheidungsfragen

Wenn unklar ist, wohin eine Funktion gehört, helfen diese Fragen:

### 1. Arbeitet die Funktion hauptsächlich mit `this`?

Wenn ja, spricht viel für eine Methode.

Beispiel:

```js
this.levelLength
this.tileWidth
```

### 2. Beantwortet die Funktion eine fachliche Frage über dieses Objekt?

Zum Beispiel:

```js
landscape.getTileCount(...)
```

Das liest sich wie eine natürliche Fähigkeit von `Landscape`.

### 3. Könnte dieselbe Funktion sinnvoll völlig unabhängig von dieser Klasse verwendet werden?

Wenn ja, kann ein Helper sinnvoller sein.

### 4. Muss ich bei einer Helper-Funktion ständig Objektwerte wieder als Parameter hineinreichen?

Wenn der Aufruf so aussieht:

```js
calculateSomething(
  this.a,
  this.b,
  this.c,
  value
);
```

ist das häufig ein Hinweis darauf, dass die Logik eigentlich zum Objekt gehört.

## Merksatz

```text
Methode
→ Verhalten eines Objekts
→ nutzt häufig this
→ gehört fachlich zur Klasse

Helper
→ allgemeine, unabhängige Operation
→ bekommt alles über Parameter
→ kennt keinen Objektzustand
```

Kurz:

> **Objektbezogene Logik bleibt beim Objekt. Allgemeine Logik darf in den Helper.**

## Aktuelles Angry-Forrest-Beispiel

Für die aktuelle Architektur ist

```js
Landscape.getTileCount(parallaxFactor)
```

passender als eine globale Helper-Funktion, weil `levelLength` und `tileWidth` Eigenschaften der Landscape sind.

Ein späterer Refactor zu einem Helper wäre immer noch möglich, falls dieselbe Berechnung unabhängig von `Landscape` an mehreren Stellen gebraucht wird.
