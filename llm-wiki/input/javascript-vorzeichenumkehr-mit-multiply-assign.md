# Vorzeichenumkehr mit `*= -1`

## Grundidee

In JavaScript kann ein numerischer Wert mit `*= -1` sehr kompakt zwischen positiv und negativ umgeschaltet werden.

```js
value *= -1;
```

Das ist eine Kurzform von:

```js
value = value * -1;
```

Ein positiver Wert wird negativ, ein negativer Wert wird positiv.

```js
let direction = 1;
direction *= -1; // -1
direction *= -1; // 1
```

Das ist besonders praktisch, wenn eine Variable zwei entgegengesetzte Richtungen mit `1` und `-1` repräsentiert.

---

## Warum ist das nützlich?

Bei Bewegungsrichtungen könnte man auch schreiben:

```js
if (direction === 1) {
  direction = -1;
} else {
  direction = 1;
}
```

Wenn wirklich nur das Vorzeichen umgedreht werden soll, ist

```js
direction *= -1;
```

aber kürzer und drückt die Absicht direkt aus:

> Nimm die bestehende Richtung und kehre sie um.

---

## Beispiel aus Angry Forrest

Beim Robot kann eine Richtungsvariable mit `1` und `-1` arbeiten.

Wenn der Robot sich nach einer Aktion umdrehen soll, kann statt einer Fallunterscheidung geschrieben werden:

```js
this.direction *= -1;
```

Aus:

```js
this.direction = 1;
```

wird:

```js
this.direction = -1;
```

und umgekehrt.

---

## Wichtig

Die Technik ist nur dann sinnvoll, wenn die Variable wirklich als symmetrisches Zahlenpaar gedacht ist, zum Beispiel:

```text
1  = eine Richtung
-1 = Gegenrichtung
```

Für Zustände wie Strings ist sie natürlich nicht geeignet:

```js
fightState = "charge";
```

Hier gibt es kein mathematisches Gegenstück, das durch Multiplikation erzeugt werden könnte.

---

## Merksatz

```js
x *= -1;
```

bedeutet:

> **Behalte den Betrag, aber kehre das Vorzeichen um.**

Für Richtungswerte `1` und `-1` ist das ein sehr kompakter Richtungswechsel.
