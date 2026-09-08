# Bewegungsziel: Live-Wert vs. eingefrorener Zielpunkt

## Grundidee

Bei Bewegungslogik macht es einen großen Unterschied, ob ein Ziel **in jedem Frame neu berechnet** oder **einmal gespeichert** wird.

Live-Ziel:

```js
const targetX = character.x + 200;
```

wenn diese Zeile in jedem Update erneut ausgeführt wird.

Eingefrorenes Ziel:

```js
this.chargeTargetX = character.x + 200;
```

wenn der Wert einmal beim Start einer Aktion gespeichert wird.

Beide Varianten sind korrekt – sie beschreiben aber völlig unterschiedliches Verhalten.

---

## Live-Ziel = verfolgen

Wenn das Ziel jedes Frame neu berechnet wird:

```js
chargeTowardsCharacter() {
  const targetX = this.world.character.x + 200;

  if (this.x > targetX) {
    this.x -= 2;
  }
}
```

bewegt sich `targetX` mit dem Character mit.

Das Objekt verfolgt also kein festes Ziel, sondern einen beweglichen Bezugspunkt.

Das eignet sich für:

- Verfolger,
- Homing-Verhalten,
- Gegner, die ständig auf die aktuelle Position reagieren.

---

## Eingefrorenes Ziel = Aktion zu einem Snapshot

Wenn das Ziel nur einmal gespeichert wird:

```js
this.chargeTargetX = this.world.character.x + 200;
```

und danach nur noch verwendet wird:

```js
if (this.x > this.chargeTargetX) {
  this.x -= 2;
}
```

bleibt das Ziel gleich, auch wenn sich der Character danach bewegt.

Das eignet sich für:

- Dash-Angriffe,
- Sprünge zu einem festgelegten Punkt,
- Attacken, die beim Start „zielen“ und danach ausgeführt werden.

---

## Beispiel aus Angry Forrest

Beim Robot-Boss wurde zunächst ein Ziel während der laufenden Choreographie aus der aktuellen Character-Position berechnet.

Dadurch konnte der Zielpunkt mitwandern.

Ein experimenteller Ansatz war deshalb:

```js
checkActivation() {
  if (!this.isActivated && this.world.character.x >= this.x - 300) {
    this.isActivated = true;
    this.chargeTargetX = this.world.character.x + 200;
  }
}
```

Danach bewegte sich der Robot zu genau diesem gespeicherten Punkt:

```js
chargeTowardsTarget() {
  if (this.x < this.chargeTargetX) {
    this.x += 2;
  } else if (this.x > this.chargeTargetX) {
    this.x -= 2;
  }
}
```

Der Character konnte sich inzwischen weiterbewegen, ohne das bereits gewählte Ziel zu verändern.

---

## Wichtige Designfrage

Vor jeder Bewegungslogik lohnt sich die Frage:

> Soll das Objekt den aktuellen Gegner **verfolgen** oder eine bereits begonnene Aktion zu einem **festen Ziel** ausführen?

Das entscheidet, ob der Zielwert live gelesen oder vorher gespeichert werden sollte.

---

## Merksatz

```text
Ziel jedes Frame neu berechnen
= Ziel bewegt sich mit

Ziel einmal speichern
= Snapshot der Situation beim Start der Aktion
```

Der Unterschied ist klein im Code, aber groß im Gameplay-Verhalten.
