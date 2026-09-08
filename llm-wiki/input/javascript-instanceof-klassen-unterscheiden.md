# `instanceof` – konkrete Objektklassen unterscheiden

## Grundidee

Mit `instanceof` kann in JavaScript geprüft werden, ob ein Objekt von einer bestimmten Klasse erzeugt wurde oder aus deren Vererbungskette stammt.

```js
object instanceof SomeClass
```

Das Ergebnis ist ein Boolean:

```js
true
false
```

Beispiel:

```js
class Enemy {}
class Gnome extends Enemy {}

const gnome = new Gnome();

console.log(gnome instanceof Gnome); // true
console.log(gnome instanceof Enemy); // true
```

Weil `Gnome` von `Enemy` erbt, ist ein Gnome sowohl eine Instanz von `Gnome` als auch von `Enemy`.

---

## Warum ist das nützlich?

Manchmal liegen unterschiedliche konkrete Objektarten gemeinsam in einem Array.

Dann kann die gemeinsame Verarbeitung gleich bleiben, während einzelne Klassen zusätzliche Speziallogik erhalten.

```js
for (const enemy of enemies) {
  if (enemy instanceof Gnome) {
    // Gnome-spezifisches Verhalten
  }
}
```

---

## Beispiel aus Angry Forrest

`level.enemies` enthält sowohl Gnomes als auch den Robot-Boss.

Darum kann die Projectile-Collision zunächst allgemein erkennen:

```js
if (fruit.isColliding(enemy)) {
  fruit.hit();
}
```

und danach nach konkreter Klasse unterscheiden:

```js
if (enemy instanceof Gnome) {
  enemy.hitByFruit(fruit.direction);
} else if (enemy instanceof Robot) {
  enemy.hitByFruit();
}
```

Die Collision bleibt gemeinsam, die Trefferreaktion ist aber unterschiedlich.

Auch im Update-Loop kann so unterschieden werden:

```js
this.world.level.enemies.forEach((enemy) => {
  if (enemy instanceof Gnome) {
    enemy.updateKnockout();
  }

  if (enemy instanceof Robot) {
    enemy.updateFightBehaviour();
  }
});
```

---

## `instanceof` ist nicht immer die endgültige Architektur

Viele `instanceof`-Abfragen können ein Hinweis darauf sein, dass Polymorphie später sauberer wäre.

Statt:

```js
if (enemy instanceof Gnome) {
  enemy.updateKnockout();
} else if (enemy instanceof Robot) {
  enemy.updateFightBehaviour();
}
```

könnte eine gemeinsame Schnittstelle später beispielsweise lauten:

```js
enemy.update();
```

und jede Klasse implementiert selbst ihr Verhalten.

Für kleine, klar begrenzte Unterschiede ist `instanceof` aber völlig legitim und oft besonders verständlich.

---

## Merksatz

```js
object instanceof ClassName
```

fragt:

> **Ist dieses Objekt eine Instanz dieser Klasse oder einer davon abgeleiteten Klasse?**

Es ist besonders nützlich, wenn verschiedene Objektarten gemeinsam gespeichert werden, aber an einzelnen Stellen unterschiedlich reagieren müssen.
