# `new Class(parameter)` in JavaScript

## Grundidee

Wenn eine Klasse mit `new` erzeugt wird, kann man ihr beim Erzeugen Werte oder Objekte mitgeben:

```js
const object = new SomeClass(parameter);
```

JavaScript ruft dabei automatisch den `constructor()` dieser Klasse auf:

```js
class SomeClass {
  constructor(parameter) {
    this.parameter = parameter;
  }
}
```

Der Wert aus:

```js
new SomeClass(parameter)
```

landet also im Parameter von:

```js
constructor(parameter)
```

---

## Aktuelles Beispiel aus Angry Forrest

In `game.js` wird die Spielwelt erzeugt:

```js
world = new World(canvas);
```

Das bedeutet:

```text
new World(canvas)
        │
        ▼
constructor(canvas)
```

Der `World`-Constructor bekommt also das `canvas`, das in `game.js` übergeben wurde:

```js
class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  }
}
```

Mit:

```js
this.canvas = canvas;
```

wird der übergebene Wert im neu erzeugten `World`-Objekt gespeichert.

---

## Dasselbe Prinzip mit einem anderen Objekt als Parameter

Die `World` kann beim Erzeugen des Characters sich selbst mitgeben:

```js
this.character = new Character(this);
```

Das `this` bedeutet an dieser Stelle:

> dieses konkrete `World`-Objekt

Der Character könnte es so empfangen:

```js
class Character extends MovableObject {
  constructor(world) {
    super();
    this.world = world;
  }
}
```

Der Ablauf ist:

```text
World-Objekt
    │
    │  new Character(this)
    ▼
Character-Constructor
    │
    │  constructor(world)
    ▼
this.world = world
```

Der Character besitzt danach eine Referenz auf genau die `World`, die ihn erzeugt hat.

---

## Warum ist diese Referenz nützlich?

Die `World` besitzt beispielsweise das Keyboard:

```js
class World {
  keyboard = new Keyboard();
}
```

Wenn der Character eine Referenz auf die `World` besitzt:

```js
this.world = world;
```

kann er später auf deren Keyboard zugreifen:

```js
this.world.keyboard.left
this.world.keyboard.right
```

Ohne diese Referenz kennt ein `Character` die `World` nicht automatisch.

---

## Es sind nicht „zwei Constructoren ineinander“

Wenn innerhalb eines Constructors ein weiteres Objekt mit `new` erzeugt wird, werden nicht zwei Constructoren zu einem Constructor.

Stattdessen wird während der Erzeugung eines Objekts kurz ein weiteres Objekt erzeugt.

Beispiel:

```js
class World {
  constructor(canvas) {
    this.canvas = canvas;
    this.character = new Character(this);
  }
}
```

Vereinfacht passiert:

```text
1. new World(canvas)
2. World.constructor(canvas) startet
3. new Character(this) wird erreicht
4. Character.constructor(world) läuft
5. Character ist fertig
6. World.constructor(...) läuft weiter
7. World ist fertig
```

---

## Was bedeutet `super()` beim Character?

Der Character erbt von `MovableObject`:

```js
class Character extends MovableObject
```

Deshalb muss der Constructor des Characters zuerst den Constructor der Elternklasse aufrufen:

```js
constructor(world) {
  super();
  this.world = world;
}
```

Vereinfacht:

```text
new Character(world)
        │
        ▼
MovableObject initialisieren
        │
      super()
        │
        ▼
Character initialisieren
        │
        ▼
this.world = world
```

`super()` gehört also zur Vererbung.

`world` ist dagegen einfach ein normal übergebener Parameter.

---

## Vergleich mit einer normalen Funktion

Das Prinzip der Parameterübergabe ist dasselbe wie bei einer normalen Funktion:

```js
function showWorld(world) {
  console.log(world);
}

showWorld(myWorld);
```

Bei einer Klasse:

```js
const character = new Character(myWorld);
```

und:

```js
constructor(world) {
  this.world = world;
}
```

Der zusätzliche Unterschied ist:

> `new` erzeugt ein neues Objekt und `constructor()` initialisiert dieses Objekt.

---

## Merksatz

```js
new Class(value)
```

bedeutet vereinfacht:

> Erzeuge ein neues Objekt dieser Klasse und übergib `value` an dessen `constructor()`.

Und:

```js
this.something = value;
```

bedeutet:

> Speichere den übergebenen Wert als Eigenschaft dieses neu erzeugten Objekts.

Im aktuellen Angry-Forrest-Beispiel:

```js
this.character = new Character(this);
```

bedeutet deshalb:

> Die World erzeugt einen Character und gibt ihm eine Referenz auf sich selbst mit.
