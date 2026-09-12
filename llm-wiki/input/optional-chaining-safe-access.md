# Optional Chaining (`?.`) in JavaScript

## Allgemeine Erklärung

Optional Chaining (`?.`) erlaubt es, auf Eigenschaften oder Methoden zuzugreifen, obwohl ein Objekt möglicherweise noch nicht existiert.

Ohne Optional Chaining kann ein Zugriff wie dieser einen Fehler auslösen:

```js
this.world.stop();
```

Wenn `this.world` zu diesem Zeitpunkt `null` oder `undefined` ist, versucht JavaScript trotzdem, `.stop()` darauf aufzurufen. Das führt zu einem `TypeError`.

Mit Optional Chaining:

```js
this.world?.stop();
```

prüft JavaScript zuerst, ob `this.world` tatsächlich existiert.

- Ist `this.world` vorhanden, wird `stop()` ausgeführt.
- Ist `this.world` `null` oder `undefined`, endet der Ausdruck dort und liefert `undefined` zurück.
- Es wird kein Fehler ausgelöst.

Man kann sich `?.` vereinfacht als kurze Form einer vorherigen Existenzprüfung vorstellen:

```js
if (this.world !== null && this.world !== undefined) {
  this.world.stop();
}
```

entspricht in diesem Fall ungefähr:

```js
this.world?.stop();
```

Wichtig: Optional Chaining reagiert nur auf `null` und `undefined`. Werte wie `false`, `0` oder `""` gelten weiterhin als vorhandene Werte.

---

## Typische Varianten

### Eigenschaft sicher lesen

```js
const name = user.profile?.name;
```

Wenn `profile` nicht existiert, wird `name` nicht gelesen und das Ergebnis ist `undefined`.

### Methode nur aufrufen, wenn das Objekt existiert

```js
this.world?.stop();
```

Hier wird geprüft, ob `this.world` existiert.

### Auch die Methode selbst optional machen

```js
this.world?.stop?.();
```

Das ist eine stärkere Absicherung:

- `this.world` darf fehlen.
- `stop` darf ebenfalls fehlen.

Der Unterschied ist wichtig:

```js
this.world?.stop();
```

schützt nur vor einem fehlenden `world`. Wenn `world` existiert, aber keine Methode `stop` besitzt, entsteht weiterhin ein `TypeError`.

```js
this.world?.stop?.();
```

schützt zusätzlich davor, dass `stop` nicht existiert.

### Array-Zugriff

```js
const firstEnemy = enemies?.[0];
```

Wenn `enemies` nicht existiert, ergibt der Ausdruck `undefined`.

### Optionaler Callback

```js
onComplete?.();
```

Der Callback wird nur ausgeführt, wenn `onComplete` tatsächlich definiert ist.

---

## Beispiel aus Angry Forrest

Beim Rücksprung vom `gameOver`- oder `gameWon`-Zustand zum Intro soll die aktuell laufende Welt beendet werden.

Dafür eignet sich:

```js
this.world?.stop();
```

Die Bedeutung lautet hier:

> Falls gerade eine `World` existiert, rufe ihre `stop()`-Methode auf. Falls keine `World` existiert, mache einfach weiter.

Das ist besonders praktisch bei Lifecycle-Code, weil sich ein Objekt je nach Zustand des Programms bereits aufgebaut haben kann oder noch gar nicht existiert.

Ohne Optional Chaining müsste der gleiche Gedanke ausführlicher formuliert werden:

```js
if (this.world) {
  this.world.stop();
}
```

In diesem konkreten Fall ist

```js
this.world?.stop();
```

prägnanter und beschreibt die Absicht sehr direkt.

---

## Wichtig: `?.` fängt keine Fehler innerhalb der Methode ab

Optional Chaining verhindert nur den Zugriff auf `null` oder `undefined`.

Wenn `stop()` selbst einen Fehler enthält, wird dieser weiterhin ganz normal geworfen:

```js
this.world?.stop();
```

bedeutet also nicht:

> Versuche `stop()` und ignoriere alle Fehler.

Es bedeutet nur:

> Rufe `stop()` auf, sofern `world` existiert.

---

## Abgrenzung zu anderen Fragezeichen-Syntaxen

Das `?` taucht in JavaScript auch an anderen Stellen auf, hat dort aber eine andere Bedeutung.

### Ternärer Operator

```js
const message = won ? "Victory" : "Game Over";
```

Hier ist `?` Teil einer kurzen `if/else`-Entscheidung.

### Nullish Coalescing

```js
const name = user.name ?? "Unknown";
```

`??` liefert einen Ersatzwert, wenn links `null` oder `undefined` steht.

### Optional Chaining

```js
user.profile?.name;
```

`?.` beendet dagegen sicher eine Zugriffskette, wenn der linke Wert `null` oder `undefined` ist.

---

## Merksatz

`?.` bedeutet sinngemäß:

> Geh an dieser Stelle nur weiter, wenn der Wert links davon existiert.

Für den aktuellen Game-Lifecycle ist deshalb:

```js
this.world?.stop();
```

eine kompakte Form von:

> Stoppe die Welt, falls gerade überhaupt eine Welt vorhanden ist.
