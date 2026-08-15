# Debugging von TypeErrors – Fehler schrittweise zurückverfolgen

## Das Ziel beim Debugging

Ein Debugger ist ein hilfreiches Werkzeug, aber viele JavaScript-Fehler lassen sich bereits aus drei Dingen präzise ableiten:

1. der Fehlermeldung,
2. dem Stack Trace und
3. dem Code an den genannten Stellen.

Dabei wird nicht geraten. Man verfolgt den ungültigen Wert Schritt für Schritt zurück, bis klar ist, wo er entstanden ist.

---

## Das allgemeine Schema

Bei einem Fehler wie `TypeError` hilft diese feste Reihenfolge:

1. **Fehlerstelle lesen**  
   Welche Operation kann JavaScript an dieser Stelle nicht ausführen?
2. **Ungültigen Wert bestimmen**  
   Welcher Wert hat den falschen Typ oder ist `undefined`?
3. **Eine Ebene im Stack Trace zurückgehen**  
   Welche Zeile hat diesen Wert an die Fehlerstelle übergeben?
4. **Ausdruck auswerten**  
   Warum ergibt genau dieser Ausdruck den ungültigen Wert?
5. **Reihenfolge und Voraussetzungen prüfen**  
   Existiert die Eigenschaft bereits? Wurde ein Bild schon geladen? Läuft Code vielleicht erst später?
6. **Die kleinste Ursache beheben**  
   Nicht an der Stelle des sichtbaren Fehlers herumändern, sondern dort, wo der falsche Wert entsteht.
7. **Erneut ausführen und den nächsten Fehler getrennt behandeln**  
   Ein Folgefehler kann nach der ersten Korrektur sichtbar werden. Das ist normal.

Die Schritte 1 bis 4 sind im Grunde ein manueller Debugger: Man betrachtet dieselben Werte, nur anhand des Codes statt mit einem Haltepunkt.

---

## Beispiel: `forEach` auf `undefined`

Beim Erzeugen eines `Golem` trat diese Meldung auf:

```text
Uncaught TypeError: Cannot read properties of undefined (reading 'forEach')
    at Golem.loadImages (MovableObject.class.js:43:7)
    at new Golem (Golem.class.js:13:10)
```

### 1. Die Fehlerstelle lesen

In `loadImages()` steht:

```js
loadImages(arr) {
  arr.forEach((path) => {
    // Bilder laden
  });
}
```

`forEach()` ist eine Methode von Arrays. Die Meldung sagt deshalb eindeutig:

```js
arr === undefined
```

Nicht `forEach()` ist defekt. Das Argument `arr` hat beim Aufruf keinen gültigen Wert erhalten.

### 2. Zur Aufrufstelle zurückgehen

Der nächste Stack-Trace-Eintrag verweist auf den Konstruktor des Golems:

```js
this.loadImages(this.IMAGES_WALKING);
this.loadImages(this.IMAGES_IDLE);
```

`IMAGES_WALKING` ist im Golem definiert:

```js
IMAGES_WALKING = createAnimationImages(
  "/img/golem/Walking/Golem_Walking_",
  22,
);
```

Es ist also ein Array und kann an `loadImages()` übergeben werden.

Für `IMAGES_IDLE` gibt es in dieser Klasse jedoch keine entsprechende Definition.

### 3. Den übergebenen Ausdruck auswerten

Fehlt eine Eigenschaft an einem Objekt, liefert JavaScript `undefined`:

```js
this.IMAGES_IDLE // undefined
```

Der fehlerhafte Aufruf entspricht somit effektiv diesem Code:

```js
this.loadImages(undefined);
```

In der Methode wird daraus:

```js
undefined.forEach(...);
```

Das erklärt die Fehlermeldung vollständig.

### 4. Ursache statt Symptom korrigieren

Der Golem hatte nur eine Walking-Animation. Deshalb werden nur die dazugehörigen Bilder geladen:

```js
this.loadImage(this.IMAGES_WALKING[0]);
this.loadImages(this.IMAGES_WALKING);
this.animate(this.IMAGES_WALKING);
```

Die Aufrufe für `IMAGES_IDLE`, `IMAGES_ATTACKING`, `IMAGES_HURT` und `IMAGES_JUMPING` gehören erst dann in den Golem, wenn diese Arrays dort auch definiert wurden.

---

## Beispiel: Das erste Bild wird nicht gezeichnet

Ein anderer Fehler lautete:

```text
Failed to execute 'drawImage': The provided value is not of type HTMLImageElement
```

Der Zeichen-Code verwendet:

```js
this.ctx.drawImage(object.img, 0, 0, object.width, object.height);
```

Damit ist die erste Frage:

```js
object.img // Welchen Wert hat diese Eigenschaft beim ersten Zeichnen?
```

`loadImages()` füllt nur `imageCache`; es setzt `img` nicht. Auch `animate()` setzt `img` erst beim ersten Durchlauf des Intervalls, also beispielsweise nach 100 Millisekunden:

```js
setInterval(() => {
  this.img = this.imageCache[path];
}, 100);
```

`World.draw()` kann jedoch schon vorher laufen. Dann ist `object.img` noch `undefined`.

Die Lösung ist ein gültiger Startzustand im Konstruktor:

```js
this.loadImage(this.IMAGES_WALKING[0]);
```

Danach darf die Animation die weiteren Bilder übernehmen.

---

## Wann ein Haltepunkt trotzdem sinnvoll ist

Haltepunkte im Browser-Debugger lohnen sich besonders, wenn sich ein Wert nicht direkt aus dem Code ableiten lässt, etwa bei:

- Benutzereingaben,
- Antworten von APIs,
- asynchronen Abläufen wie `setTimeout`, Events oder Bild-Ladevorgängen,
- komplizierten Bedingungen und mehreren möglichen Programmwegen.

Dann setzt man den Haltepunkt unmittelbar vor der fraglichen Zeile und prüft gezielt den Wert, zum Beispiel `arr`, `this.IMAGES_IDLE` oder `object.img`.

Bei klaren TypeErrors reicht häufig schon das strukturierte Rückverfolgen. Ein Debugger bestätigt dann die bereits formulierte Vermutung, statt die Suche erst zu beginnen.
