# Parallax, cameraX und verschachtelte Canvas-Transformationen

## Ausgangssituation

Die spielbaren Objekte wie `Character` und `enemies` werden in `World.draw()` innerhalb einer normalen Kamera-Transformation gezeichnet:

```js
this.ctx.save();
this.ctx.translate(this.cameraX, 0);

this.drawObject(this.character);
this.drawObjects(this.level.enemies);

this.ctx.restore();
```

Damit ergibt sich für ihre sichtbare X-Position:

```text
screenX = object.x + cameraX
```

Ein Parallax-Objekt wird dagegen über eine eigene Methode gezeichnet:

```js
drawParallaxObjects(objects) {
  objects.forEach((object) => {
    this.ctx.save();
    this.ctx.translate(this.cameraX * object.parallaxFactor, 0);
    this.drawObject(object);
    this.ctx.restore();
  });
}
```

Die gedachte sichtbare Position ist damit:

```text
screenX = object.x + cameraX * parallaxFactor
```

---

## Der Fehler

Die Fruits wurden zunächst innerhalb des bereits verschobenen Kamera-Blocks gezeichnet:

```js
this.ctx.save();
this.ctx.translate(this.cameraX, 0);

this.drawObject(this.character);
this.drawObjects(this.level.enemies);
this.drawParallaxObjects(this.level.fruits);

this.ctx.restore();
```

Dabei war leicht zu übersehen, dass `drawParallaxObjects()` selbst noch einmal eine Translation ausführt.

Die Fruit erhielt also zwei X-Verschiebungen:

```text
1. cameraX
2. cameraX * parallaxFactor
```

Damit war ihre tatsächliche sichtbare Position:

```text
screenX =
fruit.x
+ cameraX
+ cameraX * parallaxFactor
```

also:

```text
screenX =
fruit.x
+ cameraX * (1 + parallaxFactor)
```

---

## Warum scheinbar `0.8` zu `1.8` passte

Der Foreground wurde mit:

```text
parallaxFactor = 1.8
```

gezeichnet.

Die Fruit erhielt zunächst:

```text
parallaxFactor = 0.8
```

Da sie jedoch zusätzlich bereits innerhalb des normalen Kamera-Offsets lag, ergab sich effektiv:

```text
1.0 + 0.8 = 1.8
```

Die Fruit bewegte sich deshalb visuell exakt mit dem Foreground.

Das zunächst überraschende Verhalten war also mathematisch korrekt:

```text
normaler Kamera-Faktor
        1.0

zusätzlicher Fruit-Parallax-Faktor
        0.8

effektive Verschiebung
        1.8
```

Dadurch entstand der Eindruck, die Fruit müsse gegenüber dem Foreground um genau `1.0` langsamer eingestellt werden.

Tatsächlich kompensierte der Wert `0.8` lediglich eine bereits vorhandene Kamera-Transformation.

---

## Ursache und Wirkung

Die Ursache war keine falsche Parallax-Formel, sondern die Verschachtelung zweier Transformationen.

```text
World Camera Translation
        ↓
cameraX

innerhalb davon:
        ↓
Parallax Translation
cameraX * parallaxFactor
```

Canvas-Transformationen werden nicht ersetzt, sondern aufeinander aufgebaut.

Die zweite Translation startet also nicht wieder bei `0`, sondern wird auf die bereits aktive Transformation addiert.

Deshalb:

```text
translate(cameraX)
+
translate(cameraX * factor)

=
cameraX + cameraX * factor
```

---

## Die Korrektur

Die Fruit musste aus dem bereits verschobenen Kamera-Block herausgenommen werden:

```js
this.ctx.save();
this.ctx.translate(this.cameraX, 0);

this.drawObject(this.character);
this.drawObjects(this.level.enemies);

this.ctx.restore();

this.drawParallaxObjects(this.level.fruits);
```

Nun wird die Fruit nur noch einmal transformiert:

```text
screenX =
fruit.x + cameraX * fruit.parallaxFactor
```

Damit kann sie denselben echten Faktor wie der Foreground verwenden:

```js
parallaxFactor = 1.8;
```

Nun gilt:

```text
Foreground:
x + cameraX * 1.8

Fruit:
x + cameraX * 1.8
```

Beide Objekte bleiben dadurch tatsächlich relativ zueinander an derselben Position.

---

## Auswirkung auf Collision Detection

Der Fehler wurde besonders deutlich bei der Collision Detection.

Die Collision-Berechnung ging zunächst von folgender sichtbarer Fruit-Position aus:

```text
fruit.x + cameraX * parallaxFactor
```

Das Rendering verwendete tatsächlich aber:

```text
fruit.x + cameraX + cameraX * parallaxFactor
```

Damit stimmten sichtbare Position und berechnete Collision-Position nicht überein.

Einige Collisions wurden dadurch zufällig erkannt, andere nicht.

Erst nachdem Rendering und Collision wieder dasselbe Koordinatensystem verwendeten, funktionierte die Collision reproduzierbar für alle Fruits.

---

## Allgemeine Erkenntnis

Bei Canvas gilt:

> Transformationen sind zustandsbehaftet und werden miteinander kombiniert.

Ein `translate()` verändert das aktuelle Koordinatensystem.

Wird innerhalb dieses Zustands erneut `translate()` aufgerufen, wirkt die zweite Transformation zusätzlich zur ersten.

Deshalb sollte bei unerwarteten Positionen oder Geschwindigkeiten nicht nur die lokale Formel geprüft werden, sondern auch:

```text
Welche Transformationen sind zu diesem Zeitpunkt bereits aktiv?
```

Besonders kritisch sind Kombinationen aus:

- Kamera-Translation
- Parallax-Translation
- Spiegelung mit `scale(-1, 1)`
- Rotation
- verschachteltem `save()` / `restore()`

---

## Merksatz

```text
Nicht nur der aktuelle translate()-Aufruf bestimmt die Position.

Entscheidend ist die Summe aller aktuell aktiven Transformationen.
```

Ein scheinbar falscher Parallax-Faktor kann daher lediglich ein Symptom einer bereits vorher angewendeten Transformation sein.
