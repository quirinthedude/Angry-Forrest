# Collectibles, Verantwortlichkeit und Array-State

## Ausgangssituation

`Fruit` ist ein eigenes Objekt in der Spielwelt und erbt von `MovableObject`.

```js
class Fruit extends MovableObject {
  width = 50;
  height = 48;

  leftOffset = 10;
  rightOffset = 10;
  topOffset = 0;
  bottomOffset = 10;

  parallaxFactor = 1.8;
}
```

Die Früchte werden im Level über ein eigenes Array verwaltet:

```js
level.fruits;
```

Der `Character` kann mit diesen Objekten kollidieren und sie einsammeln.

---

## Wer ist für das Einsammeln verantwortlich?

Zunächst liegt der Gedanke nahe, die Logik zum Einsammeln in `Fruit.class.js` zu schreiben:

```js
fruit.collect();
```

Semantisch passt das jedoch nicht gut zur Objektstruktur.

Die Fruit **wird eingesammelt**, sie führt das Einsammeln nicht selbst aus.

Die Aktion geht vom Character aus:

```js
character.collectFruit(fruit);
```

Damit bleiben die Verantwortlichkeiten klar getrennt.

### Fruit

Die Fruit beschreibt hauptsächlich ihren eigenen Zustand:

- Position
- Größe
- Bild
- Collision-Offsets
- Parallax-Verhalten

### Character

Der Character führt Aktionen aus:

- bewegt sich
- springt
- kollidiert mit Objekten
- sammelt eine Fruit ein
- verwaltet das eigene Inventar

Die Beziehung lautet also:

```text
Character → sammelt → Fruit
```

und nicht:

```text
Fruit → ist Teil von → Character
```

`Fruit` und `Character` sind vielmehr zwei verschiedene `MovableObject`-Instanzen innerhalb derselben World.

---

## Das Array als World-State

Die vorhandenen Fruits werden über

```js
this.world.level.fruits;
```

verwaltet.

Dieses Array ist damit der aktuelle Zustand der Welt bezüglich der vorhandenen Früchte.

Beispiel:

```js
collectFruit(fruit) {
  const index = this.world.level.fruits.indexOf(fruit);

  if (index === -1) return;

  this.world.level.fruits.splice(index, 1);

  this.fruitInventory++;

  this.fruitSound.currentTime = 0;
  this.fruitSound.play();
}
```

Der entscheidende Schritt ist:

```js
this.world.level.fruits.splice(index, 1);
```

Damit wird die eingesammelte Fruit aus dem Array entfernt.

---

## Warum verschwindet die Fruit automatisch?

Die World rendert die Fruits direkt aus diesem Array.

Sinngemäß:

```js
this.drawParallaxObjects(this.level.fruits);
```

Nach dem `splice()` existiert die eingesammelte Fruit dort nicht mehr.

Dadurch wird sie beim nächsten Renderdurchlauf automatisch nicht mehr gezeichnet.

Dasselbe gilt auch für die Collision-Abfrage:

```js
for (const fruit of this.world.level.fruits) {
  // Collision prüfen
}
```

Die entfernte Fruit wird ebenfalls nicht mehr geprüft.

Damit reicht eine einzige Zustandsänderung:

```text
Fruit aus level.fruits entfernen
             ↓
nicht mehr rendern
             ↓
nicht mehr auf Collision prüfen
```

Es muss also nicht separat definiert werden:

```text
fruit.visible = false
fruit.collidable = false
fruit.active = false
```

Solange alle beteiligten Systeme denselben World-State benutzen, ergibt sich dieses Verhalten automatisch.

---

## Allgemeines OOP-Prinzip

Die wichtige Erkenntnis ist:

> Ein Objekt muss nicht selbst die Aktion implementieren, die ein anderes Objekt mit ihm ausführt.

Die Verantwortlichkeit sollte bei dem Objekt liegen, das die Aktion ausführt.

Außerdem kann ein Array mehr sein als nur eine Liste von Objekten:

> Wenn Rendering, Collision und Spiellogik denselben Array-Zustand verwenden, wird dieser Array zu einem zentralen Teil des World-State.

Dieses Muster lässt sich später ebenso auf andere Spielobjekte übertragen:

```text
Coins
Munition
Keys
Power-Ups
Collectibles
Gegner
Projektile
```

Wird ein Objekt aus der jeweiligen aktiven Collection entfernt, verschwindet es damit automatisch aus den Systemen, die diese Collection verwenden.
