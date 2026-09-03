# Zentrale Game Loop vs. objektbezogene Intervalle

## Ausgangspunkt

In JavaScript-Spielen können wiederkehrende Aufgaben auf sehr unterschiedliche Weise organisiert werden.

Ein möglicher Ansatz ist eine **zentrale Schleife**, die regelmäßig alle relevanten Objekte aktualisiert:

```js
function update() {
  character.update();
  enemies.forEach((enemy) => enemy.update());
  robot.update();
}
```

Ein anderer Ansatz lässt einzelne Objekte oder einzelne Aufgaben ihre **eigene Taktung** besitzen:

```js
setInterval(() => character.move(), 1000 / 60);
setInterval(() => enemy.move(), 1000 / 30);
setInterval(() => character.animate(), 100);
```

Beide Modelle lösen dasselbe Grundproblem:

> Eine bestimmte Funktion soll wiederholt ausgeführt werden.

Der wesentliche Unterschied liegt darin, **wer für den Zeitpunkt der Ausführung verantwortlich ist**.

---

## Modell 1: zentrale Taktung

Bei einer zentralen Game Loop gibt es einen gemeinsamen Taktgeber:

```text
Game Loop
   |
   +--> Character.update()
   +--> Gnome.update()
   +--> Robot.update()
   +--> Collision.update()
```

Der Takt gehört dem Spiel als Ganzem. Die Objekte müssen lediglich wissen, **was** sie bei einem Update tun sollen.

Das entspricht konzeptionell stark einem klassischen Interrupt- oder Hauptschleifen-Denken:

```text
Takt
 ↓
alle notwendigen Arbeiten nacheinander ausführen
 ↓
nächster Takt
```

### Vorteile

- Ein zentraler Ort kontrolliert den Spielzustand.
- Starten, Stoppen und Pausieren ist einfach.
- Die Reihenfolge der Updates ist sichtbar und kontrollierbar.
- Kollision, Bewegung und andere voneinander abhängige Berechnungen lassen sich deterministisch ordnen.
- Es entstehen nicht viele unabhängig laufende Timer.

### Nachteil

Alle Systeme hängen zunächst an derselben Grundtaktung. Soll etwas beispielsweise nur alle 500 ms passieren, muss diese langsamere Frequenz innerhalb der Game Loop modelliert werden, etwa mit Zeitdifferenzen oder Zählern.

---

## Modell 2: jedes Verhalten besitzt seinen eigenen Timer

Junus zeigt im FAQ-Beispiel eine andere Perspektive. Funktionen registrieren selbst, wie häufig sie ausgeführt werden sollen:

```js
setStopableInterval(sayHello, 500);
setStopableInterval(sayGoodbye, 500);
```

Der Wrapper speichert dabei jede erzeugte Interval-ID:

```js
let intervalIds = [];

function setStopableInterval(fn, time) {
  let id = setInterval(fn, time);
  intervalIds.push(id);
}
```

Damit können später alle registrierten Intervalle gemeinsam beendet werden:

```js
function stopGame() {
  intervalIds.forEach(clearInterval);
}
```

Die wichtige Idee ist weniger `clearInterval()` selbst als die entstehende Struktur:

```text
Character movement ------> eigener Timer
Gnome movement ----------> eigener Timer
Animation ---------------> eigener Timer
anderes Verhalten -------> eigener Timer

              ↓
      intervalIds sammelt
      alle Timer-Handles
```

Das Objekt oder Verhalten bestimmt also stärker selbst, **wann** es ausgeführt wird.

---

## Warum braucht `setInterval()` überhaupt eine ID?

`setInterval()` registriert einen wiederkehrenden Auftrag beim Browser und gibt dafür eine Kennung zurück:

```js
const id = setInterval(fn, 500);
```

Diese ID ist ein Handle auf den laufenden Timer.

```js
clearInterval(id);
```

bedeutet sinngemäß:

> Beende genau den wiederkehrenden Auftrag, der unter dieser ID registriert wurde.

Ohne gespeicherte ID läuft das Intervall weiter, solange die Seite lebt oder bis es auf andere Weise beendet wird.

Junus' Wrapper löst deshalb ein **Lifecycle-Problem**: Er sorgt dafür, dass die erzeugten Timer später wieder auffindbar sind.

---

## Der eigentliche Perspektivwechsel

Die beiden Modelle unterscheiden sich in der Verteilung der Verantwortung.

### Zentrale Game Loop

```text
Scheduler kennt Objekte
Objekte kennen ihre Update-Logik
```

Der Scheduler sagt:

> Jetzt seid ihr alle dran.

### Objektbezogene Intervalle

```text
Objekte / Funktionen registrieren eigene Zeitpläne
Browser verwaltet die Timer
```

Das einzelne Verhalten sagt:

> Führe mich alle 500 ms aus.

Das ist keine bloße syntaktische Abweichung, sondern eine andere Architekturentscheidung.

---

## Ist der Ansatz mit vielen Intervallen „moderner“?

Nicht grundsätzlich.

Moderne Hardware macht es zwar problemlos möglich, zahlreiche Timer und Callbacks zu verwalten. Dadurch ist es nicht mehr notwendig, aus Ressourcengründen jede wiederkehrende Aufgabe in einen einzigen selbstgebauten Taktgeber zu pressen.

Daraus folgt aber nicht:

```text
viele Intervalle = moderner = besser
```

Für Spiele ist eine zentrale Update-Schleife weiterhin ein sehr verbreitetes und sinnvolles Muster, insbesondere wenn viele Zustände voneinander abhängen.

Objektbezogene Timer sind dagegen praktisch, wenn verschiedene Vorgänge wirklich unterschiedliche und weitgehend unabhängige Zeitpläne besitzen.

Die bessere Frage lautet deshalb:

> Gehört diese Taktung zum Gesamtsystem oder zum Lebenszyklus dieses einzelnen Verhaltens?

---

## Angry Forrest: momentan ein Hybrid

Der aktuelle Code benutzt bereits beide Denkweisen.

### Zeichnen

`World.draw()` fordert mit `requestAnimationFrame()` immer das nächste sichtbare Bild an.

```js
requestAnimationFrame(() => this.draw());
```

Das ist eine zentrale Render-Schleife.

### Bewegung des Characters

`Character.moveCharacter()` besitzt dagegen ein eigenes Intervall:

```js
setInterval(() => {
  this.handleHorizontalMovement();
  this.handleJump();
  this.updateVerticalMovement();
  this.updateCamera();
  this.handleCollision();
  this.updateAnimation(wantsToWalk);
}, 1000 / 60);
```

### Sprite-Animation

Auch `MovableObject.animate()` erzeugt für die Bildfolge ein eigenes Intervall:

```js
this.animationInterval = setInterval(() => {
  // nächstes Sprite-Bild wählen
}, speed);
```

Das Projekt ist deshalb aktuell weder vollständig zentral getaktet noch vollständig timerbasiert.

```text
World.draw()              requestAnimationFrame
Character movement       setInterval 60 Hz
Sprite animation         eigenes setInterval
```

Dieser Hybrid ist nicht automatisch falsch. Er macht aber sichtbar, dass unterschiedliche Teile des Spiels derzeit unterschiedliche Scheduling-Modelle verwenden.

---

## Wann eignet sich welcher Ansatz?

### Zentraler Update-Takt

Gut geeignet für:

- Bewegung
- Physik
- Gravitation
- Kollisionserkennung
- Kamera
- Gegnerzustände, die miteinander interagieren
- globale Pause / Game Over

Diese Dinge bilden gemeinsam den momentanen **Spielzustand**.

### Eigener Timer

Gut geeignet für relativ unabhängige Vorgänge wie:

- ein Ereignis alle paar Sekunden
- Cooldowns
- verzögerte Aktionen
- bestimmte UI-Effekte
- Animationen mit eigener Bildrate
- zeitlich klar abgegrenzte Abläufe

Dabei sollte aber immer geklärt sein, wer den Timer wieder beendet.

---

## Der Wrapper als Timer-Registry

Junus' Funktion kann man deshalb allgemeiner als kleine **Timer-Registry** verstehen:

```js
let intervalIds = [];

function setStopableInterval(fn, time) {
  const id = setInterval(fn, time);
  intervalIds.push(id);
}
```

Sie kapselt zwei Schritte:

```text
Timer erzeugen
+
Timer für später merken
```

`stopGame()` übernimmt anschließend die zentrale Aufräumverantwortung:

```js
function stopGame() {
  intervalIds.forEach(clearInterval);
}
```

Architektonisch interessant ist die Kombination:

> Die Ausführung darf dezentral geplant werden, aber ihr Lifecycle wird wieder zentral kontrollierbar gemacht.

Genau darin liegt der eigentliche Wert des Wrappers.

---

## Wichtige Einschränkung: `setInterval()` ist kein Hardware-Interrupt

Die Ähnlichkeit zum Interrupt-Denken ist nützlich, aber technisch begrenzt.

JavaScript im Browser führt diese Callback-Funktionen normalerweise nicht parallel mitten in anderem JavaScript aus. Ein fälliger Timer stellt seinen Callback zur Ausführung bereit; ausgeführt wird er erst, wenn der JavaScript-Ausführungskontext dafür frei ist.

Darum bedeutet:

```js
setInterval(fn, 500);
```

nicht:

> `fn` wird garantiert exakt alle 500 ms ausgeführt.

Sondern eher:

> Nach ungefähr 500 ms darf `fn` wieder ausgeführt werden, sobald die Laufzeitumgebung dazu kommt.

Für Spielphysik sollte deshalb langfristig nicht blind angenommen werden, dass jeder Tick exakt gleich lang dauert.

---

## Merksätze

> Eine zentrale Game Loop zentralisiert **Scheduling und Reihenfolge**.

> Eigene Intervalle delegieren die **Taktung an einzelne Verhaltensweisen**.

> Eine Interval-Registry wie `setStopableInterval()` verbindet dezentrale Timer mit zentralem Lifecycle-Management.

> Viele Timer sind nicht automatisch moderner oder sauberer als eine Game Loop – sie sind ein anderes Werkzeug für eine andere Verteilung von Verantwortung.

Für Angry Forrest ist daher nicht entscheidend, eines der beiden Modelle dogmatisch zu wählen. Entscheidend ist, bewusst festzulegen, **welche Zeitsteuerung zum globalen Spielzustand gehört und welche tatsächlich lokal bleiben soll**.
