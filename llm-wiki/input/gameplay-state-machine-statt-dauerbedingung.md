# Gameplay-Choreographie mit States statt Dauerbedingungen

## Grundidee

Eine Bedingung, die in jedem Game-Loop erneut ausgewertet wird, beschreibt oft keinen Ablauf, sondern nur eine dauerhafte Regel.

Beispiel:

```js
if (distance > 250) {
  runTowardsCharacter();
}
```

Wenn diese Abfrage ungefähr 60-mal pro Sekunde läuft, bedeutet sie:

> Solange der Abstand größer als 250 Pixel ist, bewege dich auf den Character zu.

Das kann völlig korrekt sein – es ist aber keine Choreographie.

Eine Choreographie besteht aus aufeinanderfolgenden Zuständen:

```text
prepareAttack
→ charge
→ waiting
```

Dabei entscheidet ein State, **was gerade passiert**, und eine Bedingung entscheidet nur noch, **wann in den nächsten State gewechselt wird**.

---

## Warum ist das nützlich?

Ohne States können Bedingungen ungewollt zu Reglern werden.

Zum Beispiel:

```js
if (distance > 250) {
  runTowardsCharacter();
}
```

führt dazu, dass ein Gegner immer wieder nachläuft, sobald der Abstand größer wird.

Das Ergebnis kann wie ein unsichtbares Gummiband wirken:

```text
Character entfernt sich
→ Abstand > 250
→ Gegner läuft nach
→ Abstand <= 250
→ Gegner stoppt
→ Character entfernt sich wieder
→ Gegner läuft wieder nach
```

Mit einem State kann derselbe Abstand nur das Ende einer konkreten Aktion markieren.

---

## Beispiel aus Angry Forrest

Für den Robot-Boss wurde zunächst versucht:

```js
updateFightBehaviour() {
  const character = this.world.character;
  const distance = Math.abs(this.x - character.x);

  if (distance > 250) {
    this.runTowardsCharacter();
  }
}
```

Dadurch hielt der Robot im Wesentlichen einen festen Abstand zum Character.

Für die Boss-Choreographie ist ein expliziter State klarer:

```js
updateFightBehaviour() {
  if (!this.isFighting || this.isDead) return;

  if (this.fightState === "prepareAttack") {
    this.prepareAttack();
  } else if (this.fightState === "charge") {
    this.chargeTowardsTarget();
  } else if (this.fightState === "waiting") {
    this.checkNextAttack();
  }
}
```

Jetzt bedeutet `charge`:

> Der Robot befindet sich gerade in der Angriffsbewegung.

Und die Distanz kann nur noch entscheiden, wann diese konkrete Phase endet:

```js
if (distance <= 80) {
  this.fightState = "waiting";
  this.setAnimation(this.IMAGES_ATTACKING, 100);
}
```

---

## Trigger statt Dauerverhalten

Ein neuer Angriff kann später durch verschiedene Ereignisse ausgelöst werden:

```js
if (distance > 250) {
  this.fightState = "prepareAttack";
}
```

oder durch einen Treffer:

```js
hitByFruit() {
  // Damage-Logik ...
  this.fightState = "prepareAttack";
}
```

Beide Wege führen in denselben definierten Ablauf:

```text
prepareAttack
→ Bombe
→ Run-Attack
→ waiting
```

---

## Wann braucht man keine State Machine?

Nicht jede Bewegung braucht einen State.

Für einfache Regeln reicht oft eine direkte Bedingung:

```js
if (keyboard.right) {
  character.x += speed;
}
```

States werden besonders nützlich, wenn Aktionen:

- eine Reihenfolge besitzen,
- nur einmal ausgelöst werden sollen,
- Animationen wechseln,
- durch verschiedene Ereignisse unterbrochen werden können,
- oder klar definierte Übergänge haben.

---

## Merksatz

Eine Dauerbedingung beantwortet:

> **Was soll gelten, solange diese Bedingung wahr ist?**

Ein State beantwortet:

> **In welchem Schritt des Ablaufs befindet sich das Objekt gerade?**

Für Gameplay-Choreographien ist der zweite Gedanke oft deutlich stabiler.
