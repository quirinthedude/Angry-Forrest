# State Machines – Abläufe verständlich modellieren

## Grundidee

Eine **Finite State Machine (FSM)** beschreibt einen Ablauf über eine begrenzte Anzahl von Zuständen. Sie beantwortet zwei Fragen:

- **State (Zustand):** Was passiert gerade?
- **Transition (Übergang):** Unter welcher Bedingung beginnt die nächste Phase?

Ein State muss keine eigene Klasse sein. Für einfache Abläufe genügt oft ein String und eine übersichtliche `update()`-Methode.

**Wichtigster Merksatz:** Die Implementierung soll den Ablauf leichter verständlich machen – nicht abstrakter, als nötig.

---

## Beispiel aus Angry Forrest: die Startanimation

Nach dem Laden der Spielwelt steigt Entie von unten auf, ein „Get Ready“-Banner fährt herein, bleibt kurz stehen und fährt wieder hinaus. Erst danach wird Gameplay freigegeben.

~~~text
rise
  │  Entie erreicht groundY
  ▼
bannerIn
  │  Banner erreicht seine Zielposition
  ▼
wait
  │  1000 ms vergangen
  ▼
bannerOut
  │  Banner vollständig ausserhalb des Canvas
  ▼
Game.finishWorldActivation()
~~~

Die Abfolge ist **linear**. Es gibt keine Rücksprünge oder Verzweigungen. Deshalb kann der Code selbst bereits fast wie ein Ablaufdiagramm lesbar sein.

### Zustände in `update()`

Der folgende Ausschnitt zeigt die gemeinsam vereinfachte, lokal bearbeitete Fassung von `StartScene`. **Hinweis:** Beim Erstellen dieser Lektion waren die Änderungen noch nicht auf `main` committed.

~~~js
update() {
  if (this.state === "rise") {
    this.raiseCharacter();
  } else if (this.state === "bannerIn") {
    this.moveBannerIn();
  } else if (this.state === "wait") {
    this.wait();
  } else if (this.state === "bannerOut") {
    this.moveBannerOut();
  }
}
~~~

Beim Lesen sieht man die zeitliche Reihenfolge der Animation. Jede Phase hat genau eine zuständige Methode. Die Methode `update()` wählt aus, **was jetzt ausgeführt werden soll**.

### Verhalten und Zustandswechsel

~~~js
raiseCharacter() {
  this.character.y -= 2;

  if (this.character.y <= this.character.groundY) {
    this.character.y = this.character.groundY;
    this.state = "bannerIn";
  }
}
~~~

Solange der State `rise` aktiv ist, bewegt sich Entie nach oben. Erst wenn der Boden erreicht ist, wechselt der State zu `bannerIn`.

~~~js
moveBannerIn() {
  if (this.getReady.moveIn()) {
    this.state = "wait";
    this.waitStartedAt = performance.now();
  }
}
~~~

`moveIn()` erledigt die Bewegung und gibt zurück, ob die Zielposition erreicht ist. Erst dann beginnt die Wartephase.

~~~js
wait() {
  if (performance.now() - this.waitStartedAt >= 1000) {
    this.state = "bannerOut";
  }
}

moveBannerOut() {
  if (this.getReady.moveOut()) {
    this.world.game.finishWorldActivation();
  }
}
~~~

Die letzte Phase legt keinen weiteren `StartScene.state` fest: Sie meldet ihren Abschluss an das übergeordnete `Game`. Das Spiel entfernt die Startszene und wechselt nach `playing`.

**Beobachtung:** State und Transition lassen sich gedanklich unterscheiden. Bei einer derart einfachen Sequenz müssen sie aber **nicht** in separate Klassen, Tabellen oder einen Transition-Manager zerlegt werden.

---

## Zwei State Machines – zwei Verantwortlichkeiten

Angry Forrest besitzt hier zwei verschiedene Zustandswerte:

~~~js
game.state             // "starting"
game.startScene.state  // "rise", später "bannerIn" usw.
~~~

- `Game.state` beschreibt die Phase des **gesamten Spiels** (`intro`, `loading`, `starting`, `playing` …).
- `StartScene.state` beschreibt die Phase **innerhalb der Startanimation**.

Sie widersprechen sich nicht. Der übergeordnete Zustand `starting` verhindert etwa, dass die normale Character-Bewegungslogik bereits Gameplay verarbeitet: `Character.canUpdateCharacter()` verlangt `game.state === "playing"`.

**OOP-Lektion:** Jede Instanz verwaltet den Zustand, für den sie verantwortlich ist. `StartScene` entscheidet, **wann sie fertig ist**; `Game` entscheidet, **was dann mit dem Spiel passiert**.

---

## Was das Refactoring verbessert hat

In der ursprünglichen Klasse stand `state = "starting"` direkt vor `state = "rise"`. Der zweite Wert überschrieb den ersten sofort. Auch `duration = 2000` und `startedAt = performance.now()` waren unbenutzt. Ein auskommentierter Aufruf von `finishWorldActivation()` in `raiseCharacter()` verwies auf einen überholten Ablauf.

Die eigentliche Schwierigkeit lag jedoch in einer uneinheitlichen `update()`: `rise` delegierte an eine Methode; `bannerIn` und `bannerOut` führten ihre Logik direkt innerhalb der Verzweigung aus.

Nach dem Auslagern in `moveBannerIn()` und `moveBannerOut()` kann man die gesamte Sequenz an einem Ort überblicken, **ohne das Animationsverhalten zu verändern**.

### Wichtig für die Verhaltensgleichheit

- Entie steigt weiterhin **2 Pixel pro Update**.
- Das Banner bewegt sich weiterhin **10 Pixel pro Update**; `SlidingBanner` prüft auch, ob sein Bild geladen ist.
- Die Wartezeit bleibt **1000 Millisekunden**, gemessen mit `performance.now()`.
- Die Übergänge werden weiterhin nur im jeweiligen aktiven Zustand ausgewertet.
- Das Gameplay wird erst freigeschaltet, wenn das Banner vollständig hinausgefahren ist.

Bewegung erfolgt hier **pro Update**, die Wartephase dagegen nach **vergangener Zeit**. Das ist eine bewusste Eigenschaft der bestehenden Implementierung. Eine spätere Umstellung auf `deltaTime` wäre ein **eigenständiges, möglicherweise sichtbares Verhaltens-Refactoring**.

---

## Wann braucht eine State Machine mehr Struktur?

Eine einfache, fest vorgegebene Reihenfolge lässt sich gut mit `if/else` oder `switch` ausdrücken. Beide Varianten sind möglich; ein `switch` ist nicht automatisch besser.

Komplexer wird es bei:

- mehreren möglichen Folgezuständen;
- Rücksprüngen und wiederkehrenden Angriffen;
- Unterbrechungen (z. B. Treffer während einer Attacke);
- Ereignissen aus verschiedenen Objekten;
- Zustandsübergängen, deren Regeln nicht mehr an einer Stelle erkennbar sind.

Bei einer solchen Boss-Choreografie kann es sinnvoll werden, Übergänge explizit zu dokumentieren oder zentraler zu verwalten. Das bedeutet aber **nicht**, dass jede kleine Animation ein State-Pattern, eigene State-Klassen oder ein Framework benötigt.

**Praktischer Prüfstein:** Kann eine neue Person (oder ich selbst in einigen Wochen) aus `update()` und wenigen klar benannten Methoden den Ablauf verstehen? Wenn ja, ist die Struktur für diesen Zweck wahrscheinlich ausreichend.

---

## Weiterführende Projektbeispiele

- [StartScene.class.js](../../js/models/StartScene.class.js) – lineare Startanimation
- [Game.class.js](../../js/models/Game.class.js) – übergeordneter Spiel-Lebenszyklus
- [SlidingBanner.class.js](../../js/models/SlidingBanner.class.js) – Ausführung der Bannerbewegung
- [Gameplay-Choreographie mit States statt Dauerbedingungen](gameplay-state-machine-statt-dauerbedingung.md) – warum States bei Bossverhalten wichtig werden

## Merksatz

> **Eine State Machine ordnet Verhalten in nachvollziehbare Phasen. Ihre Umsetzung sollte nur so komplex sein wie der Ablauf, den sie beschreibt.**

Diese Lektion darf wachsen, wenn wir bei komplexeren State Machines in Angry Forrest neue Probleme oder bessere Lösungen tatsächlich erleben.
