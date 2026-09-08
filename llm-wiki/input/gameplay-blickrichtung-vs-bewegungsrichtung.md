# Blickrichtung und Bewegungsrichtung sind nicht dasselbe

## Grundidee

In einfachen Spielen wird oft eine einzige Variable wie `direction` für mehrere Dinge verwendet:

- Sprite spiegeln,
- Bewegungsrichtung bestimmen,
- Angriffsrichtung festlegen.

Das funktioniert nur, solange diese Bedeutungen wirklich zusammenfallen.

Sobald ein Sprite eine ungewöhnliche native Ausrichtung besitzt oder eine Animation anders gespiegelt werden muss, können **visuelle Blickrichtung** und **mathematische Bewegungsrichtung** auseinanderlaufen.

Dann entsteht leicht ein Moonwalk-Effekt: Die Figur schaut in eine Richtung, bewegt sich aber in die andere.

---

## Typisches gemeinsames Modell

Ein einfaches Modell kann so aussehen:

```js
direction = 1;
```

und Bewegung:

```js
this.x += speed * this.direction;
```

Dann bedeutet beispielsweise:

```text
1  → nach rechts
-1 → nach links
```

Wenn dieselbe Variable auch das Spiegeln steuert, muss diese Zuordnung exakt zur nativen Sprite-Ausrichtung passen.

---

## Beispiel aus Angry Forrest

`MovableObject.move()` arbeitet mathematisch mit `direction`:

```js
move(speed) {
  this.x += speed * this.direction;
}
```

Beim Robot zeigte sich aber, dass die für das korrekte Spiegeln benötigte Blickrichtung nicht intuitiv mit der x-Bewegung übereinstimmte.

Eine Methode wie:

```js
faceCharacter(character) {
  this.direction = character.x < this.x ? 1 : -1;
}
```

konnte den Robot optisch korrekt zum Character schauen lassen.

Wurde danach aber blind ausgeführt:

```js
this.move(2);
```

konnte die Bewegung in die falsche Richtung gehen.

---

## Bewegung unabhängig vom Sprite bestimmen

Wenn die Bedeutungen auseinanderfallen, kann die reale Bewegung direkt aus den Positionen berechnet werden:

```js
if (character.x < this.x) {
  this.x -= 2;
} else {
  this.x += 2;
}
```

Damit beantwortet dieser Code nur die Frage:

> In welche Richtung muss sich die x-Position ändern, um näher an den Character zu kommen?

Die visuelle Orientierung kann separat behandelt werden:

```js
this.faceCharacter(character);
```

---

## Sauberere langfristige Modellierung

Wenn diese Trennung häufiger gebraucht wird, können auch zwei verschiedene Zustände sinnvoll sein:

```js
facingDirection
movementDirection
```

oder eine Bewegungsmethode, die ihr Ziel direkt kennt:

```js
moveTowards(targetX) {
  if (targetX < this.x) {
    this.x -= this.speed;
  } else {
    this.x += this.speed;
  }
}
```

Dann ist `direction` nicht mehr gezwungen, gleichzeitig Darstellung und Physik zu erklären.

---

## Merksatz

> **Wohin eine Figur schaut und wohin sich ihre Koordinate verändert, sind zwei verschiedene Fragen.**

Oft kann dieselbe Variable beide beantworten. Wenn Moonwalk oder falsche Spiegelung auftreten, sollte diese Kopplung als Erstes geprüft werden.
