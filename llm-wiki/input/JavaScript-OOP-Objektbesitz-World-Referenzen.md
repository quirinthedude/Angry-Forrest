# JavaScript OOP: Objektbesitz, Referenzen und `setWorld(world)`

## Ausgangspunkt

In einem objektorientierten Spiel existieren viele Instanzen gleichzeitig:

```text
World
├── Character
├── Enemies
│   ├── Gnome
│   ├── Gnome
│   └── Robot
├── Landscape
├── Sky
└── ...
```

Dabei ist eine wichtige Frage:

> Woher weiß ein Objekt überhaupt, dass andere Objekte existieren?

Ein `Robot` kennt zunächst nur seine eigenen Eigenschaften:

```js
this.x
this.y
this.width
this.height
this.IMAGES_IDLE
```

Er weiß nicht automatisch:

- wo der Character ist
- welche Gegner noch existieren
- wie groß das Level ist
- wo sich die Kamera befindet
- welche Objekte gerade in der Welt aktiv sind

Nur weil zwei Objekte im selben Spiel existieren, bedeutet das nicht, dass sie automatisch aufeinander zugreifen können.

---

## Besitz im OOP-Kontext

Wenn wir sagen:

```js
world.character
```

bedeutet das:

> Die `World`-Instanz besitzt eine Referenz auf die `Character`-Instanz.

Zum Beispiel:

```js
class World {
  character;

  constructor() {
    this.character = new Character();
  }
}
```

Die Struktur ist dann:

```text
World
  │
  └── character
        │
        └── Character-Instanz
```

Die `World` kann dadurch direkt auf den Character zugreifen:

```js
this.character.x
```

oder von außen:

```js
world.character.x
```

Wichtig:

> "Besitzen" bedeutet hier nicht Besitz im realen Sinn, sondern dass ein Objekt eine Referenz auf ein anderes Objekt gespeichert hat.

---

## Eine Referenz ist kein Kopieren

Wenn wir schreiben:

```js
robot.world = world;
```

wird die World nicht kopiert.

Der Robot bekommt nur eine Referenz auf dieselbe bereits existierende Instanz:

```text
robot.world ──────┐
                  │
                  ▼
               World
                  ▲
                  │
world ────────────┘
```

Daher gilt:

```js
robot.world === world
```

Beide Variablen zeigen auf dasselbe Objekt.

---

# Vererbung und Besitz sind unterschiedliche Beziehungen

Ein häufiger Denkfehler ist, Vererbung und Objektbeziehungen miteinander zu vermischen.

Beim Robot gilt:

```js
class Robot extends MovableObject
```

Das ist **Vererbung**:

```text
Robot
  ↓ extends
MovableObject
```

Der Robot erhält dadurch Eigenschaften und Methoden von `MovableObject`.

Zum Beispiel:

```js
moveLeft()
moveRight()
animate()
loadImage()
loadImages()
```

Eine Referenz auf `World` ist dagegen keine Vererbung.

```js
this.world = world;
```

bedeutet:

```text
Robot
  │
  └── world ───► World
```

Das ist eine **Objektbeziehung**.

Kurz:

```text
extends
→ Vererbung

this.world = world
→ Referenz auf eine andere Instanz
```

---

# Warum der Robot die World braucht

Der Robot wird zunächst in `level1.js` erzeugt:

```js
const level1 = new Level(
  [
    new Gnome(...),
    new Gnome(...),
    new Gnome(...),
    new Robot(2300, 360),
  ],
  new Sky(),
  new Landscape(),
);
```

Zu diesem Zeitpunkt existiert die `World` noch nicht.

Später wird sie erzeugt:

```js
world = new World(canvas);
```

Dadurch entsteht ein zeitliches Problem:

```text
1. level1 entsteht
2. Robot entsteht
3. World existiert noch nicht
4. später entsteht World
```

Darum können wir nicht einfach beim Robot schreiben:

```js
new Robot(x, y, world)
```

Denn `world` existiert zu diesem Zeitpunkt noch nicht.

---

# Die Lösung: `setWorld(world)`

Wir geben dem Robot die World nachträglich.

Zum Beispiel:

```js
class Robot extends MovableObject {
  world;

  setWorld(world) {
    this.world = world;
  }
}
```

Die Methode macht nur eine Sache:

```js
this.world = world;
```

Sie speichert die übergebene World-Instanz als Referenz im Robot.

Wenn später ausgeführt wird:

```js
robot.setWorld(world);
```

gilt danach:

```js
robot.world === world
```

---

# Schritt für Schritt

Angenommen:

```js
const robot = new Robot(2300, 360);
```

Zunächst kennt der Robot nur sich selbst:

```text
Robot
├── x
├── y
├── width
├── height
└── animations
```

Dann entsteht später:

```js
const world = new World(canvas);
```

Danach wird ausgeführt:

```js
robot.setWorld(world);
```

Jetzt sieht die Beziehung so aus:

```text
Robot
├── x
├── y
├── animations
└── world ────────────────┐
                          │
                          ▼
                        World
                          │
                          ├── character
                          ├── enemies
                          ├── landscape
                          └── cameraX
```

Ab diesem Moment kann der Robot zum Beispiel schreiben:

```js
this.world.character.x
```

---

# Warum das für Gegnerlogik wichtig ist

Ohne `world` weiß der Robot zwar:

```js
this.x
```

aber nicht:

```js
character.x
```

Mit der Referenz kann er beide Werte vergleichen:

```js
this.world.character.x
this.x
```

Damit wird beispielsweise ein Aktivierungstrigger möglich:

```js
if (this.world.character.x > this.x - 600) {
  // Robot aktiviert sich
}
```

Sinngemäß:

```text
Character nähert sich dem Robot
        ↓
Abstand wird geprüft
        ↓
Trigger erreicht
        ↓
Boss aktiviert sich
```

---

# Beispiel: Boss-Entrance

Der Robot könnte zunächst einen Zustand haben:

```js
isActivated = false;
```

Dann:

```js
checkActivation() {
  if (
    !this.isActivated &&
    this.world.character.x > this.x - 600
  ) {
    this.isActivated = true;
  }
}
```

Die Methode kann das nur tun, weil:

```js
this.world.character.x
```

erreichbar ist.

Ohne `world` wäre der Robot isoliert.

---

# Kollisionen

Dasselbe Prinzip wird für Collision Detection wichtig.

Zum Beispiel:

```js
this.isColliding(this.world.character)
```

oder vereinfacht:

```js
if (
  this.world.character.x < this.x + this.width &&
  this.world.character.x + this.world.character.width > this.x
) {
  // Kollision
}
```

Auch hier braucht der Robot:

- seine eigene Position
- die Position des Characters

Seine eigene Position kennt er bereits:

```js
this.x
```

Die Position des Characters bekommt er über:

```js
this.world.character.x
```

---

# Braucht jedes Objekt eine World-Referenz?

Nein.

Eine gute Faustregel ist:

> Ein Objekt braucht eine `world`-Referenz, wenn sein Verhalten Informationen aus der gemeinsamen Spielwelt benötigt.

Typische aktive Objekte:

```text
Character
Robot
Gnome
andere Gegner
Projektile
bewegliche NPCs
eventuell Collectibles mit eigener Logik
```

Diese Objekte müssen möglicherweise wissen:

- wo der Character ist
- wo Gegner stehen
- ob eine Kollision passiert
- ob ein Trigger erreicht wurde
- wo das Level endet

Rein passive Objekte brauchen das meistens nicht:

```text
Sky
Grass
BackgroundObject
rein dekorative Objekte
```

Ein `BackgroundObject` muss nicht wissen, wo der Character steht, wenn es nur gezeichnet wird.

---

# World als gemeinsame Spielumgebung

Man kann `World` daher als zentrale gemeinsame Umgebung verstehen:

```text
                  World
          ┌─────────┼─────────┐
          │         │         │
          ▼         ▼         ▼
      Character   Robot     Gnome
                     │
                     │
                     └── kann über world
                         andere Bewohner finden
```

Die World verbindet die Bewohner indirekt miteinander.

Der Robot muss nicht direkt gespeichert bekommen:

```js
this.character = character;
```

Stattdessen reicht:

```js
this.world = world;
```

Denn darüber erreicht er:

```js
this.world.character
```

und bei Bedarf später auch:

```js
this.world.enemies
this.world.landscape
this.world.cameraX
```

---

# Warum `setWorld()` statt Constructor?

Idealerweise könnte man schreiben:

```js
new Robot(x, y, world);
```

Aber in Angry Forrest wird der Robot bereits in `level1.js` erzeugt, bevor `World` existiert.

Darum verwenden wir eine nachträgliche Zuweisung:

```js
robot.setWorld(world);
```

Das ist eine Form von **Dependency Injection**:

> Eine benötigte Abhängigkeit wird dem Objekt von außen zur Verfügung gestellt.

Hier geschieht das nach der Erzeugung des Robots.

---

# Merksätze

## Objektbesitz

```text
world.character
```

bedeutet:

> `world` besitzt eine Referenz auf den Character.

## Referenz

```js
this.world = world;
```

bedeutet:

> Dieses Objekt merkt sich, welche World-Instanz gemeint ist.

## Vererbung

```js
class Robot extends MovableObject
```

bedeutet:

> Robot übernimmt Verhalten und Eigenschaften von MovableObject.

## World-Referenz

```js
this.world.character.x
```

bedeutet:

> Der Robot erreicht den Character über die gemeinsame World.

## Entscheidungsregel

> Aktive Weltobjekte brauchen eine World-Referenz dann, wenn sie Informationen über andere Teile der Spielwelt benötigen.

---

# Kurzfassung

```text
Robot kennt zunächst nur sich selbst.

Robot.setWorld(world)
        ↓
Robot speichert Referenz auf World
        ↓
Robot kann World-Inhalte erreichen
        ↓
this.world.character
        ↓
Aktivierung, Kollision, Verfolgung, Angriff
werden möglich
```

Der entscheidende Gedanke lautet:

> **Objekte wissen nicht automatisch voneinander. Beziehungen zwischen Instanzen müssen ausdrücklich hergestellt werden.**
