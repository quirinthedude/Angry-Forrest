# JavaScript: `filter()` und Arrow Functions

## Allgemeine Erklärung

`Array.prototype.filter()` erzeugt aus einem bestehenden Array ein neues Array.

Dabei wird jedes Element des ursprünglichen Arrays nacheinander geprüft. Für jedes Element ruft `filter()` eine Callback-Funktion auf.

Diese Callback-Funktion muss einen booleschen Wert liefern:

```js
true
```

bedeutet:

> Dieses Element bleibt im neuen Array.

```js
false
```

bedeutet:

> Dieses Element wird nicht in das neue Array übernommen.

Die Schleife selbst ist bei `filter()` nicht sichtbar. Sie wird intern von JavaScript ausgeführt.

Darum sieht man statt einer klassischen Schleife häufig nur eine Funktion wie:

```js
array.filter((element) => condition);
```

Die Arrow Function

```js
(element) => condition
```

wird dabei automatisch einmal für jedes Element des Arrays aufgerufen.

## Vergleich mit einer klassischen Schleife

Dieser Code:

```js
const activeBombs = [];

for (const bomb of bombs) {
  if (!bomb.isFinished()) {
    activeBombs.push(bomb);
  }
}

bombs = activeBombs;
```

kann mit `filter()` wesentlich kompakter geschrieben werden:

```js
bombs = bombs.filter((bomb) => !bomb.isFinished());
```

Die Bedeutung ist dieselbe:

```text
für jede Bombe
↓
prüfe isFinished()
↓
false → Bombe behalten
true  → Bombe entfernen
```

## Warum steht kein `return` in der Arrow Function?

Eine Arrow Function mit genau einem Ausdruck darf ohne geschweifte Klammern geschrieben werden:

```js
(bomb) => !bomb.isFinished()
```

JavaScript gibt das Ergebnis dieses Ausdrucks automatisch zurück.

Das entspricht vollständig:

```js
function (bomb) {
  return !bomb.isFinished();
}
```

oder als Arrow Function mit Block:

```js
(bomb) => {
  return !bomb.isFinished();
}
```

## Direkter Bezug zu Angry Forrest

Für die Bomben im Spiel kann die World mehrere Bomben in einem Array verwalten:

```js
bombs = [];
```

Jede Bombe kennt ihren eigenen Lebenszyklus und kann beispielsweise melden, ob ihre Animation beendet ist:

```js
isFinished() {
  return Date.now() - this.createdAt >= this.lifeTime;
}
```

Danach können abgelaufene Bomben entfernt werden:

```js
this.world.bombs = this.world.bombs.filter(
  (bomb) => !bomb.isFinished(),
);
```

Wichtig ist die Negation mit `!`:

```js
bomb.isFinished()
```

liefert `true`, wenn die Bombe fertig ist.

Für `filter()` wollen wir aber genau die Bomben behalten, die noch nicht fertig sind:

```js
!bomb.isFinished()
```

Damit gilt:

```text
isFinished() === false
→ !false === true
→ Bombe bleibt

isFinished() === true
→ !true === false
→ Bombe wird herausgefiltert
```

## Unterschied zu `forEach()`

`forEach()` führt ebenfalls eine Callback-Funktion einmal für jedes Element aus:

```js
bombs.forEach((bomb) => bomb.update());
```

Aber `forEach()` baut kein neues Array.

`filter()` dagegen entscheidet anhand des Rückgabewerts der Callback-Funktion, welche Elemente in ein neues Array übernommen werden.

Kurz:

```text
forEach()
→ etwas mit jedem Element tun

filter()
→ bestimmte Elemente behalten
```

## Merksatz

```js
array.filter((element) => bedingung)
```

bedeutet gedanklich:

```text
Gehe durch jedes Element.
Wenn die Bedingung true ist, behalte es.
Wenn sie false ist, lasse es weg.
```

Die sichtbare Arrow Function ersetzt dabei nicht die Schleife selbst. Sie beschreibt nur die Prüfung, die `filter()` intern für jedes Element ausführt.
