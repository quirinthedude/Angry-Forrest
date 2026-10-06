# JavaScript `Set` – aktive Zustände eindeutig speichern

## Grundidee

Ein `Set` ist in JavaScript eine Sammlung von **eindeutigen Werten**.

Im Unterschied zu einem Array kann derselbe Wert nicht mehrfach im Set vorkommen.

```js
const names = new Set();

names.add("Quirin");
names.add("Lua");
names.add("Quirin");

console.log(names);
```

Obwohl `"Quirin"` zweimal hinzugefügt wurde, enthält das Set den Wert nur einmal.

Ein `Set` eignet sich deshalb besonders gut für Situationen, in denen nicht wichtig ist, **wie oft** etwas vorkommt, sondern nur:

> Ist dieses Objekt oder dieser Wert gerade bereits bekannt?

---

## Wichtige Methoden

### Wert hinzufügen

```js
mySet.add(value);
```

Beispiel:

```js
activeEnemies.add(enemy);
```

---

### Prüfen, ob ein Wert enthalten ist

```js
mySet.has(value);
```

Beispiel:

```js
if (activeEnemies.has(enemy)) {
  console.log("Enemy ist bereits registriert");
}
```

`has()` liefert einen Boolean:

```js
true;
false;
```

---

### Einen Wert entfernen

```js
mySet.delete(value);
```

Beispiel:

```js
activeEnemies.delete(enemy);
```

---

### Alle Werte entfernen

```js
mySet.clear();
```

Danach ist das Set wieder leer.

---

## Warum `Set` für Objekte besonders praktisch ist

Ein Set kann nicht nur Strings oder Zahlen speichern, sondern auch Objekte.

```js
const robot1 = new MiniRobot(...);
const robot2 = new MiniRobot(...);

const robots = new Set();

robots.add(robot1);

robots.has(robot1); // true
robots.has(robot2); // false
```

JavaScript merkt sich dabei die konkrete Objektinstanz.

Man braucht also keine zusätzliche ID wie:

```js
robot.id = 17;
```

um später herauszufinden, ob genau dieser Robot bereits bekannt ist.

---

# Beispiel aus Angry Forrest

Beim Character soll ein MiniRobot Schaden verursachen, wenn der Character neu mit ihm kollidiert.

Solange beide Objekte jedoch mehrere Frames lang übereinanderliegen, soll nicht in jedem Frame erneut Schaden entstehen.

Dafür kann sich der Character die momentan bekannten Kollisionen merken:

```js
activeMiniRobotCollisions = new Set();
```

Beim ersten Kontakt ist der MiniRobot noch nicht enthalten:

```js
if (!this.activeMiniRobotCollisions.has(enemy)) {
  this.takeDamage(10);
  this.activeMiniRobotCollisions.add(enemy);
}
```

Der Ablauf ist:

```text
1. Character kollidiert mit MiniRobot
2. Set enthält MiniRobot noch nicht
3. Character bekommt Schaden
4. MiniRobot wird dem Set hinzugefügt
```

Im nächsten Frame besteht die geometrische Kollision weiterhin.

Jetzt gilt aber:

```js
this.activeMiniRobotCollisions.has(enemy);
```

Ergebnis:

```js
true;
```

Dadurch entsteht kein erneuter Schaden.

---

## Kontakt und Kollision sind nicht dasselbe

Eine Collision Detection wird typischerweise viele Male pro Sekunde ausgeführt.

Bei 60 Updates pro Sekunde kann dieselbe Kollision beispielsweise so aussehen:

```text
Frame 1  → collision
Frame 2  → collision
Frame 3  → collision
Frame 4  → collision
...
Frame 40 → collision
```

Spielmechanisch handelt es sich aber möglicherweise nur um **einen Kontakt**.

Das `Set` erlaubt deshalb die Unterscheidung zwischen:

```text
Kollision besteht
```

und:

```text
Kollision hat gerade neu begonnen
```

Diese Unterscheidung ist besonders wichtig bei:

- Gegnerkontakt
- Collectibles
- Trigger-Zonen
- Checkpoints
- Schaltern
- Damage-Zonen
- Objekten, die nur einmal pro Kontakt reagieren sollen

---

# Vergleich mit einem Zeit-Cooldown

Eine andere Möglichkeit wäre:

```js
const now = Date.now();

if (now - this.lastHit > 1000) {
  this.takeDamage(10);
}
```

Das bedeutet jedoch:

> Solange die Kollision besteht, entsteht alle 1000 ms erneut Schaden.

Ein `Set` beantwortet dagegen eine andere Frage:

> Ist das noch derselbe Kontakt oder ist ein neuer Kontakt entstanden?

Damit beschreibt das Set in diesem Fall die eigentliche Spielmechanik genauer als ein Timer.

---

# Merksatz

Ein `Set` eignet sich besonders gut, wenn gespeichert werden soll:

> **Welche eindeutigen Dinge sind momentan aktiv?**

Im Fall von Angry Forrest:

```js
activeMiniRobotCollisions;
```

bedeutet:

> Welche MiniRobots befinden sich momentan bereits in einem bekannten Kontakt mit dem Character?

Damit wird aus einer kontinuierlichen Collision Detection ein klar definierter Spielzustand.
