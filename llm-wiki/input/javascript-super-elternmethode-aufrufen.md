# JavaScript `super` – Verhalten der Elternklasse weiterverwenden

## Grundidee

Bei Vererbung kann eine Unterklasse eine Methode ihrer Elternklasse **überschreiben**.

Manchmal soll die Unterklasse aber nicht das komplette Verhalten neu schreiben, sondern nur einen Sonderfall ergänzen und ansonsten die bestehende Logik der Elternklasse weiterverwenden.

Dafür gibt es in JavaScript das Schlüsselwort:

```js
super
```

Mit:

```js
super.methodenName()
```

wird die Implementierung der Methode aus der Elternklasse aufgerufen.

---

## Einfaches Beispiel

Eine Elternklasse definiert ein allgemeines Verhalten:

```js
class Animal {
  speak() {
    console.log("Das Tier macht ein Geräusch.");
  }
}
```

Eine Unterklasse kann diese Methode überschreiben:

```js
class Dog extends Animal {
  speak() {
    console.log("Wuff!");
  }
}
```

Jetzt wird bei einem `Dog` nur die Methode aus `Dog` ausgeführt.

```js
const dog = new Dog();
dog.speak();
```

Ausgabe:

```text
Wuff!
```

Soll die Unterklasse zusätzlich die Methode der Elternklasse verwenden, kann sie `super` benutzen:

```js
class Dog extends Animal {
  speak() {
    super.speak();
    console.log("Wuff!");
  }
}
```

Jetzt passiert beides:

```text
Das Tier macht ein Geräusch.
Wuff!
```

---

## Was macht `super.method()` genau?

Wenn innerhalb einer Unterklasse steht:

```js
super.shouldMirror()
```

bedeutet das vereinfacht:

> Suche `shouldMirror()` nicht erneut in dieser Klasse, sondern verwende die Implementierung der Elternklasse.

Dadurch entsteht keine Endlosschleife.

Bei:

```js
class Character extends MovableObject {
  shouldMirror() {
    return super.shouldMirror();
  }
}
```

wird also nicht erneut `Character.shouldMirror()` aufgerufen.

Stattdessen geht JavaScript eine Stufe nach oben zu:

```text
Character
    ↓
MovableObject
```

und führt dort `shouldMirror()` aus.

---

# Beispiel aus Angry Forrest

Im Projekt besitzt `MovableObject` die allgemeine Logik dafür, ob ein bewegliches Objekt gespiegelt werden soll.

Vereinfacht:

```js
class MovableObject extends DrawableObject {
  nativeDirection = -1;
  direction = 1;

  shouldMirror() {
    return this.direction !== this.nativeDirection;
  }
}
```

Damit können beispielsweise:

- Character
- Gnome
- Robot
- MiniRobot

dieselbe Richtungslogik verwenden.

Solange eine Unterklasse keine eigene `shouldMirror()`-Methode besitzt, erbt sie automatisch diese Implementierung.

---

## Das Problem beim Game Over

Der `Character` verwendet während des normalen Spiels dieselbe Spiegelungslogik.

Wenn er zuletzt in die Richtung geschaut hat, für die das Sprite gespiegelt werden muss, bleibt diese Richtung auch nach seinem Tod erhalten.

Beim Tod wird aber das normale Character-Bild durch ein Grabstein-PNG ersetzt:

```js
DEAD_IMAGE = "./img/character/dead/6.png";
```

In `characterDies()` wird dieses Bild geladen:

```js
characterDies() {
  if (this.isDead) return;

  this.isDead = true;
  this.energy = 0;

  this.stopWalkingSound();
  this.stopAnimation();
  this.loadImage(this.DEAD_IMAGE);

  this.world.characterDied();
}
```

Der Renderer behandelt den Character danach weiterhin wie jedes andere bewegliche Objekt.

In `World.drawObject()` wird geprüft:

```js
if (object.shouldMirror()) {
  this.drawMirroredObject(object);
} else {
  this.drawRegularObject(object);
}
```

Dadurch konnte auch der Grabstein gespiegelt werden.

Das ist beim normalen Character sinnvoll, beim Grabstein jedoch nicht:

```text
RIP
```

würde spiegelverkehrt erscheinen.

---

## Lösung mit `super`

Der `Character` braucht deshalb einen Sonderfall:

> Wenn der Character tot ist, darf sein Bild niemals gespiegelt werden.

Für alle anderen Zustände soll aber weiterhin exakt die normale Logik aus `MovableObject` gelten.

Darum überschreibt `Character` die Methode:

```js
shouldMirror() {
  if (this.isDead) return false;
  return super.shouldMirror();
}
```

Die Methode besteht damit aus zwei Teilen.

### Sonderfall der Unterklasse

```js
if (this.isDead) return false;
```

Nur `Character` kennt hier die Bedeutung seines Todeszustands und des Grabsteinbildes.

Wenn der Character tot ist, wird die weitere Spiegelungslogik gar nicht mehr ausgeführt.

---

### Standardverhalten der Elternklasse

Wenn der Character lebt:

```js
return super.shouldMirror();
```

Damit wird die bereits vorhandene Methode aus `MovableObject` verwendet:

```js
shouldMirror() {
  return this.direction !== this.nativeDirection;
}
```

Die vorhandene Richtungslogik muss also nicht in `Character` dupliziert werden.

---

## Ablauf im Spiel

Wenn der Character lebt:

```text
World.drawObject(character)
        ↓
character.shouldMirror()
        ↓
isDead === false
        ↓
super.shouldMirror()
        ↓
MovableObject.shouldMirror()
        ↓
direction !== nativeDirection
```

Wenn der Character tot ist:

```text
World.drawObject(character)
        ↓
character.shouldMirror()
        ↓
isDead === true
        ↓
return false
        ↓
Grabstein wird nicht gespiegelt
```

---

## Warum nicht einfach die Richtung ändern?

Eine mögliche Alternative wäre beim Tod:

```js
this.direction = this.nativeDirection;
```

Das würde den Grabstein ebenfalls ungespiegelt erscheinen lassen.

Die Lösung ist aber weniger sauber.

Denn damit wird der **Zustand des Characters verändert**, nur um ein Problem der Darstellung zu lösen.

Die tatsächliche Blickrichtung vor seinem Tod geht dadurch verloren.

Mit:

```js
shouldMirror() {
  if (this.isDead) return false;
  return super.shouldMirror();
}
```

bleiben zwei Dinge getrennt:

```text
direction
    → beschreibt die Richtung des Characters

shouldMirror()
    → entscheidet, wie das aktuelle Bild dargestellt wird
```

Der Tod verändert damit nicht künstlich die Bewegungs- oder Richtungsdaten.

---

## Warum ist `super` hier besonders sinnvoll?

Ohne `super` könnte man auch schreiben:

```js
shouldMirror() {
  if (this.isDead) return false;
  return this.direction !== this.nativeDirection;
}
```

Das funktioniert technisch.

Aber damit wäre die Richtungslogik doppelt vorhanden:

```js
MovableObject.shouldMirror()
Character.shouldMirror()
```

Falls die allgemeine Spiegelungslogik später geändert wird, müsste möglicherweise an mehreren Stellen Code angepasst werden.

Mit:

```js
return super.shouldMirror();
```

bleibt die eigentliche Standardlogik ausschließlich in `MovableObject`.

`Character` ergänzt nur seinen Sonderfall.

Das folgt dem DRY-Prinzip:

> Don't Repeat Yourself.

---

# `super()` im Constructor

`super` kann nicht nur Methoden der Elternklasse aufrufen.

Bei Klassenvererbung wird es auch im Constructor verwendet.

Beispiel:

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
}

class Dog extends Animal {
  constructor(name) {
    super(name);
    this.type = "dog";
  }
}
```

Hier bedeutet:

```js
super(name);
```

> Führe den Constructor der Elternklasse `Animal` aus.

Dadurch wird dort:

```js
this.name = name;
```

gesetzt.

In einem Constructor einer abgeleiteten Klasse muss `super()` ausgeführt werden, bevor auf `this` zugegriffen werden kann.

---

## Zwei wichtige Formen von `super`

### Constructor der Elternklasse aufrufen

```js
super();
```

oder mit Parametern:

```js
super(name);
```

### Methode der Elternklasse aufrufen

```js
super.shouldMirror();
```

oder beispielsweise:

```js
super.update();
```

---

## Zusammenhang mit Method Overriding

`super` wird besonders interessant, wenn eine Methode überschrieben wird.

Ohne `super`:

```js
class Child extends Parent {
  method() {
    // komplett eigenes Verhalten
  }
}
```

Mit `super`:

```js
class Child extends Parent {
  method() {
    // eigener Sonderfall

    return super.method();
  }
}
```

Das bedeutet:

> Die Unterklasse erweitert oder spezialisiert das Verhalten, anstatt es vollständig zu ersetzen.

Genau das passiert beim `Character`:

```js
shouldMirror() {
  if (this.isDead) return false;

  return super.shouldMirror();
}
```

Der Character sagt damit sinngemäß:

> Für meinen Todeszustand habe ich eine eigene Regel.  
> In allen anderen Fällen verwende ich die normale Regel für `MovableObject`.

---

## Merksatz

**`super` greift auf die Elternklasse zu.**

```js
super()
```

ruft den Constructor der Elternklasse auf.

```js
super.method()
```

ruft die entsprechende Methode der Elternklasse auf.

Besonders nützlich ist `super`, wenn eine Unterklasse nur einen **Sonderfall ergänzen** soll und das allgemeine Verhalten der Elternklasse weiterhin gültig bleibt.

Im Angry-Forrest-Beispiel:

```js
shouldMirror() {
  if (this.isDead) return false;
  return super.shouldMirror();
}
```

bedeutet das:

> Tot → eigene Regel des `Character`.

> Lebendig → normale Spiegelungsregel des `MovableObject`.
