# Method Chaining in JavaScript – Verkettung durch Rückgabewerte

## Allgemeine Erklärung

**Method Chaining** (Methodenverkettung) bedeutet, mehrere Methodenaufrufe direkt hintereinanderzuschreiben:

```js
objekt.methodeA().methodeB();
```

Das funktioniert, wenn `methodeA()` einen Wert zurückgibt, auf dem `methodeB()` aufgerufen werden kann.

**Entscheidend ist der Rückgabewert – nicht, ob eine Methode den Zustand eines Objekts verändert.**

Die zweite Methode gehört also nicht zwingend zum ursprünglichen Objekt. Sie wird auf dem **Ergebnis des vorherigen Aufrufs** ausgeführt.

### Einfaches Beispiel mit Strings

```js
const result = "  HELLO WORLD  "
  .trim()
  .toLowerCase()
  .replace("world", "quirin");

console.log(result); // "hello quirin"
```

Schrittweise passiert dasselbe:

```js
const original = "  HELLO WORLD  ";
const trimmed = original.trim();
const lower = trimmed.toLowerCase();
const result = lower.replace("world", "quirin");
```

Jede String-Methode gibt hier einen neuen String zurück. Auf diesem können wieder String-Methoden aufgerufen werden.

## Wann ist eine Verkettung möglich?

Nicht jede Methode eignet sich dafür. Das hängt von ihrem **Rückgabewert** ab:

- Gibt sie einen String zurück, kann man darauf String-Methoden aufrufen.
- Gibt sie ein Array zurück, kann man darauf Array-Methoden aufrufen.
- Gibt sie ein Promise zurück, kann man beispielsweise `.then()` oder `.catch()` aufrufen.
- Gibt sie `undefined` zurück, lässt sich darauf keine weitere Methode aufrufen.
- Eine selbst geschriebene Methode kann auch `return this;` verwenden, damit weitere Methoden **desselben Objekts** verkettet werden können.

### Beispiel: Verkettung desselben Objekts

```js
class Counter {
  value = 0;

  add(amount) {
    this.value += amount;
    return this;
  }

  reset() {
    this.value = 0;
    return this;
  }
}

const counter = new Counter();
counter.add(2).add(3); // counter.value === 5
counter.reset().add(1); // counter.value === 1
```

Hier verändern die Methoden den Zustand **und** liefern anschließend das Objekt selbst zurück. Zustandsänderung und Verkettbarkeit schließen sich also nicht aus.

---

## Beispiel aus Angry Forrest: `deathSound.play().catch()`

Bei der Überarbeitung der Klasse `MiniRobot` wurde die Audioverantwortung aus `knockOut()` in `playKnockoutSound()` ausgelagert:

```js
/** Plays and tracks the MiniRobot's knockout sound. */
playKnockoutSound() {
  const audioManager = this.world.game.audioManager;

  audioManager.trackTransientAudio(this.deathSound);
  this.deathSound.currentTime = 0;
  this.deathSound
    .play()
    .catch(() => audioManager.unregister(this.deathSound));
}
```

### Was passiert bei der Verkettung?

```js
this.deathSound
  .play()
  .catch(() => audioManager.unregister(this.deathSound));
```

1. `this.deathSound` ist ein Audio-Objekt.
2. `.play()` versucht, die Wiedergabe zu starten, und gibt ein **Promise** zurück.
3. `.catch()` wird auf **diesem Promise** aufgerufen – nicht auf `deathSound`.
4. Falls die Wiedergabe scheitert und das Promise zurückgewiesen wird, entfernt der Callback den Sound aus dem AudioManager.

Die in diesem Beispiel sichtbare Verkettung ist also:

```text
Audio-Objekt
    │ .play()
    ▼
Promise
    │ .catch(...)
    ▼
Promise
```

### Dieselbe Logik ohne Method Chaining

```js
const playPromise = this.deathSound.play();

playPromise.catch(() => {
  audioManager.unregister(this.deathSound);
});
```

Die beiden Varianten führen dieselbe Fehlerbehandlung aus. Durch die Variable `playPromise` wird der Wechsel vom Audio-Objekt zum Promise deutlicher sichtbar.

### Warum steht `currentTime = 0` separat?

```js
this.deathSound.currentTime = 0;
```

Das ist eine **Zuweisung an eine Eigenschaft**, kein Methodenaufruf. Sie setzt die Abspielposition des Audio-Objekts auf den Anfang.

`.play()` verändert ebenfalls einen Zustand beziehungsweise stößt die Wiedergabe an. Der Unterschied ist nicht „Zustandsänderung versus keine Zustandsänderung“, sondern:

- `currentTime = 0` ist eine Eigenschaftszuweisung. Der Ausdruck ergibt den zugewiesenen Wert (`0`).
- `play()` ist ein Methodenaufruf mit einem **Promise als Rückgabewert**.

Deshalb schreiben wir:

```js
this.deathSound.currentTime = 0;
this.deathSound.play().catch(() => {
  audioManager.unregister(this.deathSound);
});
```

**Gegenbeispiel:** `this.deathSound.pause().play()` funktioniert nicht: `pause()` gibt `undefined` zurück, also gibt es darauf keine `play()`-Methode.

### Warum überhaupt `catch()`?

`HTMLMediaElement.play()` ist asynchron. Browser können den Start der Wiedergabe zum Beispiel aufgrund von Autoplay-Regeln verweigern. Dann wird das von `play()` gelieferte Promise zurückgewiesen.

`.catch()` behandelt **diese Promise-Ablehnung**. Es ist kein allgemeiner Ersatz für die Behandlung beliebiger synchroner JavaScript-Fehler.

Im Projekt dient die Fehlerbehandlung dazu, einen nicht abspielbaren Sound wieder aus der Audio-Registrierung zu entfernen.

---

## Merksatz

**Bei einer Methodenkette entscheidet der Rückgabewert jedes Schritts, welche Methode als Nächstes aufgerufen werden darf.**

```js
audio.play().catch(handleError);
// audio.play() → Promise; Promise.catch() → neues Promise
```

Method Chaining ist deshalb nicht nur eine kürzere Schreibweise, sondern auch eine gute Übung darin, **Objekte, Rückgabewerte und asynchrone Abläufe** auseinanderzuhalten.
