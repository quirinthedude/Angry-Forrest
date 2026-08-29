---
title: "Wann forEach() nicht passt: frühzeitiges return bei Kollisionen"
topic: JavaScript
tags:
  - javascript
  - loops
  - foreach
  - collision-detection
  - oop
---

# Wann `forEach()` nicht passt: frühzeitiges `return` bei Kollisionen

Ein praktisches Beispiel aus **Angry Forrest** zeigt gut, wann `forEach()` ungeeignet ist.

## Ausgangssituation

Der Character soll prüfen, ob er mit einem Gegner kollidiert. Sobald der erste kollidierende Gegner gefunden wurde, soll genau dieses Objekt zurückgegeben werden.

Ein naheliegender Versuch wäre:

```js
checkCollisions() {
  this.world.level.enemies.forEach((enemy) => {
    if (this.isColliding(enemy)) {
      return enemy;
    }
  });
}
```

Das funktioniert jedoch nicht wie erwartet.

## Warum `return` in `forEach()` nicht funktioniert

Die Funktion innerhalb von `forEach()` ist ein eigener Callback:

```js
(enemy) => {
  return enemy;
};
```

Das `return` beendet deshalb nur diesen Callback.

Es beendet **nicht** die äußere Methode:

```js
checkCollisions();
```

Auch `forEach()` selbst lässt sich dadurch nicht frühzeitig abbrechen.

Das passt zur eigentlichen Aufgabe schlecht:

> Suche so lange, bis eine Kollision gefunden wurde, und beende dann sofort die Suche.

## Geeigneter: `for...of`

Für diesen Fall ist eine Schleife mit kontrollierbarem Programmfluss besser:

```js
checkCollisions() {
  for (const enemy of this.world.level.enemies) {
    if (this.isColliding(enemy)) {
      return enemy;
    }
  }

  return null;
}
```

Sobald eine Kollision gefunden wird:

```js
return enemy;
```

wird die gesamte Methode `checkCollisions()` beendet.

Die restlichen Gegner müssen nicht mehr geprüft werden.

## Praktischer Unterschied

Angenommen:

```text
enemies = [gnome1, gnome2, gnome3, gnome4]
```

und der Character kollidiert mit `gnome2`.

Mit `for...of`:

```text
gnome1 → keine Kollision
gnome2 → Kollision
          ↓
      return gnome2
          ↓
      Methode beendet
```

`gnome3` und `gnome4` werden gar nicht mehr untersucht.

## Warum `null` für „keine Kollision“?

Wenn eine Kollision besteht, liefert die Methode ein Objekt:

```js
return enemy;
```

Wenn keine besteht:

```js
return null;
```

Damit bleibt die Bedeutung eindeutig:

```text
Enemy-Objekt → Kollision gefunden
null         → keine Kollision
```

Ein leerer String wie

```js
return "";
```

wäre weniger passend, da ein String fachlich nichts mit einem Enemy-Objekt zu tun hat.

Die Methode kann anschließend einfach verwendet werden:

```js
const enemy = this.checkCollisions();

if (enemy) {
  // Kollision behandeln
}
```

## Faustregel

`forEach()` eignet sich besonders gut, wenn:

> Für jedes Element soll etwas ausgeführt werden.

Zum Beispiel:

```js
enemies.forEach((enemy) => {
  enemy.move();
});
```

Eine Schleife wie `for...of` eignet sich besser, wenn der Kontrollfluss wichtig wird:

- Suche beim ersten Treffer beenden
- mit `return` eine Methode verlassen
- mit `break` eine Schleife abbrechen
- mit `continue` ein Element überspringen

## Kernerkenntnis

`forEach()` ist bequem, aber gibt die Kontrolle über den Schleifenablauf weitgehend an den Callback ab.

Wenn die Aufgabe lautet:

> „Iteriere, bis eine bestimmte Bedingung erfüllt ist.“

ist eine klassische Schleifenform beziehungsweise `for...of` häufig die klarere Lösung.

Das Collision-Beispiel zeigt den Unterschied besonders deutlich:

```js
for (const enemy of enemies) {
  if (collisionFound) {
    return enemy;
  }
}
```

Hier beschreibt bereits die Struktur des Codes exakt die fachliche Absicht:

**Suche Gegner nacheinander und höre beim ersten Treffer auf.**
