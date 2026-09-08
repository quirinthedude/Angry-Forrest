# Der String `"false"` ist in JavaScript truthy

## Grundidee

In JavaScript ist der Boolean-Wert:

```js
false
```

etwas anderes als der String:

```js
"false"
```

Der String enthält Zeichen und ist deshalb ein **nichtleerer String**.

Nichtleere Strings sind in booleschen Prüfungen truthy.

```js
Boolean(false);   // false
Boolean("false"); // true
```

Das kann besonders bei Flags leicht übersehen werden.

---

## Beispiel

Richtig für einen Boolean-Flag:

```js
isFighting = false;
```

Falsch, wenn wirklich ein Boolean gemeint ist:

```js
isFighting = "false";
```

Denn diese Abfrage:

```js
if (isFighting) {
  console.log("fight active");
}
```

wird mit `"false"` trotzdem ausgeführt.

---

## Beispiel aus Angry Forrest

Beim Aufbau der Robot-State-Logik tauchte kurz auf:

```js
isFighting = "false";
```

Später wurde geprüft:

```js
if (!this.isFighting || this.isDead) return;
```

Mit einem echten Boolean:

```js
isFighting = false;
```

ist:

```js
!this.isFighting
```

`true` und das Fight-Update wird korrekt beendet.

Mit:

```js
isFighting = "false";
```

ist der String truthy und deshalb:

```js
!this.isFighting
```

`false`.

Das bedeutet: Der Code verhält sich so, als sei der Fight aktiv.

---

## Häufige falsy Werte

Zu den typischen falsy-Werten gehören:

```js
false
0
""
null
undefined
NaN
```

Dagegen sind zum Beispiel truthy:

```js
"false"
"0"
[]
{}
```

---

## Merksatz

> **Text, der `false` heißt, ist nicht der Boolean `false`.**

Wenn ein Flag gemeint ist, keine Anführungszeichen verwenden:

```js
flag = false;
```
