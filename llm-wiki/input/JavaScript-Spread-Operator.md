# JavaScript: Spread-Operator `...` bei Arrays

## Ausgangspunkt: `createTiles()`

Im Projekt **Angry Forrest** erzeugt die Helper-Funktion `createTiles()` mehrere Instanzen einer Tile-Klasse und gibt sie als Array zurück:

```js
function createTiles(TileClass, count, tileWidth, path, speed) {
  const tiles = [];

  for (let i = 0; i < count; i++) {
    tiles.push(
      new TileClass(
        path,
        speed,
        i * tileWidth
      )
    );
  }

  return tiles;
}
```

Ein Aufruf wie

```js
createTiles(
  BackgroundObject,
  5,
  865,
  "/img/landscape/BG_Decor.png",
  0.8
);
```

liefert also ein Array:

```js
[
  BackgroundObject,
  BackgroundObject,
  BackgroundObject,
  BackgroundObject,
  BackgroundObject
]
```

## Das Problem: mehrere Parallax-Ebenen

Für die Landschaft gibt es mehrere Ebenen:

- `BG_Decor`
- `Middle_Decor`
- `Foreground`

Jeder Aufruf von `createTiles()` liefert ein eigenes Array.

Ohne Spread:

```js
backgroundobject = [
  createTiles(
    BackgroundObject,
    this.tileCount,
    this.tileWidth,
    "/img/landscape/BG_Decor.png",
    0.8
  ),

  createTiles(
    BackgroundObject,
    this.tileCount,
    this.tileWidth,
    "/img/landscape/Middle_Decor.png",
    1.4
  ),

  createTiles(
    BackgroundObject,
    this.tileCount,
    this.tileWidth,
    "/img/landscape/Foreground.png",
    1.8
  )
];
```

entsteht ein **Array aus drei Arrays**:

```js
[
  [/* BG_Decor Tiles */],
  [/* Middle_Decor Tiles */],
  [/* Foreground Tiles */]
]
```

Die einzelnen `BackgroundObject`-Instanzen liegen damit eine Ebene tiefer.

## Spread-Operator

Mit `...` wird der Inhalt jedes zurückgegebenen Arrays in das äußere Array **entfaltet**:

```js
backgroundobject = [
  ...createTiles(
    BackgroundObject,
    this.tileCount,
    this.tileWidth,
    "/img/landscape/BG_Decor.png",
    0.8
  ),

  ...createTiles(
    BackgroundObject,
    this.tileCount,
    this.tileWidth,
    "/img/landscape/Middle_Decor.png",
    1.4
  ),

  ...createTiles(
    BackgroundObject,
    this.tileCount,
    this.tileWidth,
    "/img/landscape/Foreground.png",
    1.8
  )
];
```

Das Ergebnis ist ein einziges flaches Array:

```js
[
  /* BG_Decor Tile 1 */,
  /* BG_Decor Tile 2 */,
  /* ... */,
  /* Middle_Decor Tile 1 */,
  /* Middle_Decor Tile 2 */,
  /* ... */,
  /* Foreground Tile 1 */,
  /* Foreground Tile 2 */
]
```

Dadurch kann beispielsweise

```js
this.drawObjects(this.landscape.backgroundobject);
```

direkt über alle Objekte iterieren.

## Was bedeutet `...`?

Die drei Punkte haben in JavaScript zwei eng verwandte Anwendungen.

### Spread: Werte auseinanderfalten

Steht `...` dort, wo Werte **verwendet** werden, ist es der Spread-Operator.

```js
const first = [1, 2];
const second = [3, 4];

const all = [
  ...first,
  ...second
];
```

Ergebnis:

```js
[1, 2, 3, 4]
```

Merksatz:

> **Spread verteilt den Inhalt einer Sammlung auf einzelne Werte.**

Im Angry-Forrest-Beispiel:

```js
...createTiles(...)
```

bedeutet also sinngemäß:

> Nimm nicht das zurückgegebene Array als ein Element, sondern füge seine einzelnen Tile-Objekte hier ein.

## Unterschied zu Rest-Parametern

Zuvor tauchte `...` bereits bei einer möglichen flexiblen Funktionsdefinition auf:

```js
function createTiles(TileClass, count, tileWidth, ...args) {
}
```

Hier ist `...args` ein **Rest-Parameter**.

Er macht die umgekehrte Bewegung:

```text
mehrere einzelne Argumente
        ↓
      ...args
        ↓
      ein Array
```

Beispiel:

```js
function example(first, ...rest) {
  console.log(rest);
}

example("a", "b", "c", "d");
```

`rest` enthält:

```js
["b", "c", "d"]
```

### Gegenüberstellung

```text
REST
einzelne Werte
    ↓
  ...args
    ↓
   Array


SPREAD
   Array
    ↓
 ...array
    ↓
einzelne Werte
```

Die Schreibweise `...` ist dieselbe. Ob sie **Rest** oder **Spread** bedeutet, ergibt sich daraus, wo sie verwendet wird.

## Im aktuellen Projekt

Hier ist Spread besonders passend:

```js
backgroundobject = [
  ...createTiles(...),
  ...createTiles(...),
  ...createTiles(...)
];
```

Denn `createTiles()` soll weiterhin konsequent ein Array zurückgeben, während `Landscape.backgroundobject` ein gemeinsames, flaches Array aller Parallax-Objekte benötigt.

Das trennt die Verantwortlichkeiten sauber:

```text
createTiles()
    │
    ├─ erzeugt eine Gruppe Tiles
    └─ gibt Array zurück
             │
             ▼
        Spread `...`
             │
             └─ fügt einzelne Objekte
                in backgroundobject ein
```

## Kurzform

```js
const result = [...array];
```

bedeutet:

> Entfalte die Elemente von `array` an dieser Stelle.

Dagegen:

```js
function example(...args) {}
```

bedeutet:

> Sammle die übrigen Argumente in `args`.

**Spread entfaltet – Rest sammelt.**
