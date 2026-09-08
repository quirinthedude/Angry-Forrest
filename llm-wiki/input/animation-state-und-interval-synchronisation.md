# Animations-State und laufendes Interval müssen synchron bleiben

## Grundidee

Bei einer Animation gibt es mindestens zwei verschiedene Arten von Zustand:

1. **logischer Zustand** – welche Animation glaubt der Code gerade zu verwenden?
2. **technischer Zustand** – läuft tatsächlich noch ein `setInterval`, das Frames wechselt?

Diese beiden Zustände können auseinanderlaufen.

Dann sieht der Code beispielsweise:

```js
currentAnimation === IMAGES_RUN_ATTACKING
```

obwohl das dazugehörige Animationsinterval bereits gestoppt wurde.

Das Ergebnis kann ein scheinbarer Animation-Freeze ohne Fehlermeldung sein.

---

## Typisches Muster

Eine Methode kann verhindern, dass dieselbe Animation ständig neu gestartet wird:

```js
setAnimation(images, speed) {
  if (this.currentAnimation === images) return;

  this.stopAnimation();
  this.animate(images, speed);
  this.currentAnimation = images;
}
```

Das ist sinnvoll, solange `currentAnimation` zuverlässig beschreibt, welche Animation tatsächlich läuft.

---

## Wie entsteht ein inkonsistenter Zustand?

Angenommen eine einmalige Animation stoppt zuerst das bisherige Interval:

```js
animateOnce(images, speed) {
  this.stopAnimation();
  this.currentImage = 0;

  this.animationInterval = setInterval(() => {
    // Frames ...
  }, speed);
}
```

Wenn dabei `currentAnimation` nicht angepasst wird, kann intern weiterhin stehen:

```js
this.currentAnimation === this.IMAGES_RUN_ATTACKING
```

obwohl `RUN_ATTACKING` gar nicht mehr läuft.

Später wird aufgerufen:

```js
this.setAnimation(this.IMAGES_RUN_ATTACKING, 100);
```

Dann greift möglicherweise sofort:

```js
if (this.currentAnimation === images) return;
```

Der Code startet kein neues Interval, weil er glaubt, die Animation laufe bereits.

Auf dem Bildschirm bleibt aber nur das letzte Bild stehen.

---

## Beispiel aus Angry Forrest

Beim Robot wurden laufende Loop-Animationen mit Methoden wie:

```js
this.setAnimation(this.IMAGES_RUN_ATTACKING, 100);
```

gesteuert.

Treffer- oder Turn-Reaktionen verwendeten dagegen teilweise:

```js
this.animateOnce(this.IMAGES_TURNING_TO_RUN, 200);
```

Da `animateOnce()` ein vorhandenes Animationsinterval stoppen kann, muss darauf geachtet werden, dass danach nicht ein veralteter `currentAnimation`-Wert zurückbleibt.

Ein sichtbarer Freeze ohne Exception kann deshalb ein State-Synchronisationsproblem sein und nicht zwingend ein Renderingfehler.

---

## Mögliche Lösungen

Eine Möglichkeit ist, beim Stoppen auch den logischen Animationszustand zurückzusetzen:

```js
stopAnimation() {
  clearInterval(this.animationInterval);
  this.currentAnimation = undefined;
}
```

Ob das im konkreten Projekt die beste Lösung ist, hängt davon ab, wie `animateOnce()`, `animate()` und `setAnimation()` zusammenspielen.

Eine andere Möglichkeit ist, beim Start jeder Animationsart den State konsequent zu aktualisieren.

Wichtig ist weniger die konkrete Variante als die Invariante:

> Wenn `currentAnimation` sagt, dass eine Animation läuft, sollte auch wirklich der passende Frame-Loop aktiv sein.

---

## Debugging-Frage

Bei einem Freeze ohne Fehlermeldung lohnt sich zu prüfen:

```js
console.log(this.currentAnimation);
console.log(this.animationInterval);
```

und sich getrennt zu fragen:

```text
Welche Animation glaubt der State zu haben?
Welche Animation wird technisch wirklich aktualisiert?
```

---

## Merksatz

> **Ein logischer State ist nur dann zuverlässig, wenn er mit dem realen technischen Zustand synchron gehalten wird.**

Bei Animationen bedeutet das: `currentAnimation` und das tatsächlich laufende Interval dürfen nicht unbemerkt auseinanderlaufen.
