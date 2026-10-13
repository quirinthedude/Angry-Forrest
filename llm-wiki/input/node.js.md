# Node.js – JavaScript ausserhalb des Browsers und automatisierte Tests

## Grundidee

**Node.js ist kein Testframework**, sondern eine **JavaScript-Laufzeitumgebung (Runtime)**. Sie führt JavaScript aus, ohne dass dazu ein Browser geöffnet werden muss.

```text
JavaScript = Programmiersprache
       |
       +--> Browser: Webseiten, DOM, Canvas, Benutzerinteraktionen
       |
       +--> Node.js: Skripte, Server, Werkzeuge, Tests
```

Node.js verwendet die JavaScript-Engine **V8** und stellt zusätzlich Funktionen bereit, etwa um Dateien zu lesen, Netzwerkverbindungen zu verwalten oder Prozesse zu starten. Browser-spezifische Objekte wie `document` oder `window` sind dort nicht einfach vorhanden.

**Wichtig für Stellenanzeigen:** Wenn Node.js gefordert wird, ist damit normalerweise mehr gemeint als Testen – beispielsweise Backend-Entwicklung, Webserver, Kommandozeilenwerkzeuge oder Entwicklungsprozesse.

## Wie benutzt man Node.js?

Ein kleines Programm kann direkt im Terminal gestartet werden:

```js
// hello.js
console.log("Hallo aus Node.js!");
```

```bash
node --version
node hello.js
```

Der Befehl `node` startet die Node.js-Laufzeit und führt die angegebene JavaScript-Datei aus. Für solche einfachen Skripte muss man weder eine Webseite öffnen noch einen lokalen Webserver starten.

Node.js ist **nicht** dasselbe wie `npm`: `npm` ist ein Werkzeug zum Verwalten von JavaScript-Paketen. Unser Beispieltest verwendet nur eingebaute Node.js-Module; er benötigt keine zusätzliche Testbibliothek.

---

## Tests sind eine eingebaute Fähigkeit von Node.js

Node.js besitzt einen eigenen **Test-Runner**. Damit lassen sich automatisierte Tests ausführen, ohne erst Jest oder Vitest installieren zu müssen.

Im Angry-Forrest-Repository liegt dafür die Datei:

```text
tests/multi-robot-stomp.test.cjs
```

Man startet sie aus dem Projektverzeichnis mit:

```bash
node --test tests/multi-robot-stomp.test.cjs
```

Der Test-Runner führt die definierten Prüfungen aus und meldet, ob sie bestanden wurden. Ein fehlgeschlagener Test führt normalerweise zu einem von null verschiedenen Exit-Code – das ist wichtig für spätere automatische Prüfungen in CI-Pipelines.

### Was bedeutet `.cjs`?

Die Endung steht für **CommonJS**, eines der Modulsysteme von Node.js. In CommonJS werden andere Module typischerweise mit `require(...)` eingebunden:

```js
const test = require("node:test");
const assert = require("node:assert/strict");
```

- `node:test` stellt die Funktion `test(...)` bereit.
- `node:assert/strict` stellt Vergleiche wie `assert.equal(...)` bereit.
- Das Präfix `node:` kennzeichnet ein **eingebautes Node.js-Modul**.

Daneben gibt es das moderne ECMAScript-Modulsystem (ESM), häufig mit `import` und `.mjs`. Beides gehört zur JavaScript-Welt; `.cjs` ist kein spezielles Testformat.

---

## Unser Regressionstest: zwei überlappende MiniRobots

### Ausgangslage

In Angry Forrest beobachtete René: Entie landete von oben auf zwei überlappenden MiniRobots. Beide wurden ausgeknockt, Entie nahm aber trotzdem Schaden.

**Ursache im früheren Code:** `checkCollisions()` gab beim ersten Treffer sofort einen Gegner zurück. Beim erfolgreichen Stomp änderte sich zudem `character.speedY` auf `-12`. Bei einer folgenden Kollision konnte der zweite MiniRobot deshalb fälschlich wie eine seitliche Berührung behandelt werden.

Der Fix im Branch `fix/grouped-mini-robot-stomps` erfasst zunächst alle Kontakte und löst überlappende Stomp-Gruppen gemeinsam auf.

### Ein echter Ausschnitt aus der Testdatei

```js
test("one mini-robot: normal stomp and one rebound", () => {
  const a = robot();
  const player = character([a]);

  player.handleCollision();

  assert.equal(a.knockOutCount, 1);
  assert.equal(player.speedY, -12);
  assert.equal(player.damage, 0);
});
```

Der Ablauf ist:

1. `robot()` und `character([a])` bauen **simulierte Testobjekte** auf. Das sind Hilfsfunktionen in der Testdatei, keine neuen Produktionsmethoden.
2. `player.handleCollision()` führt die tatsächlich im Spiel verwendete Kollisionsmethode aus.
3. `assert.equal(a.knockOutCount, 1)` prüft: Der MiniRobot wurde einmal ausgeknockt.
4. `assert.equal(player.speedY, -12)` prüft: Entie federt wie bisher nach oben zurück.
5. `assert.equal(player.damage, 0)` prüft: Entie erhält keinen Schaden.

`assert.equal(actual, expected)` bedeutet: **Ist der tatsächliche Wert gleich dem erwarteten?** Wenn nicht, schlägt der Test fehl.

Die Datei prüft darüber hinaus beispielsweise, ob **zwei überlappende MiniRobots unabhängig von ihrer Reihenfolge** gemeinsam ausgeknockt werden und seitliche Berührungen weiterhin Schaden verursachen.

## Wie können Browser-Spielklassen in Node.js getestet werden?

Unser Spiel verwendet normale `<script>`-Dateien, Browser-Grafiken und Sounds. Würden wir den kompletten `Character`-Konstruktor in Node.js aufrufen, bräuchten wir unter anderem Browser-APIs und geladene Assets.

Die Testdatei umgeht das gezielt:

```js
const player = Object.create(Character.prototype);
```

Dadurch entsteht ein Objekt mit den Methoden der Klasse, **ohne den Konstruktor auszuführen**. Anschliessend werden nur die Eigenschaften ergänzt, die der Test benötigt, etwa `x`, `y`, `speedY` und `world.level.enemies`.

In der Testdatei geschieht ausserdem Folgendes:

- `node:fs` liest die echten JavaScript-Klassendateien vom Datenträger.
- `node:path` setzt Dateipfade zusammen.
- Ein `new Function(...)`-Wrapper lädt diese bestehenden, nicht exportierten Browser-Klassen in eine gemeinsame Testumgebung.
- Kleine Ersatzfunktionen (*Stubs*) verhindern dabei, dass Animationen, Audio oder ein kompletter Browser gestartet werden müssen.

Das ist eine **pragmatische Testbrücke für unsere bisherige Projektstruktur**. `new Function(...)` sollte nicht als allgemeine Methode zum Laden beliebiger Dateien übernommen werden: Es führt Code aus und wäre insbesondere bei nicht vertrauenswürdigen Eingaben gefährlich. Bei einem später modularisierten Projekt lassen sich Klassen regulär `export`/`import`ieren.

---

## Warum heisst das Regressionstest?

Eine **Regression** ist ein Fehler, der durch spätere Änderungen erneut auftritt, obwohl eine Funktion zuvor schon korrekt war.

```text
Fehler beobachten
      ↓
Fehler beheben
      ↓
Test schreibt das gewünschte Verhalten fest
      ↓
Spätere Änderung?
      ↓
Test warnt, wenn das Verhalten wieder kaputtgeht
```

Der Test beweist nicht, dass Angry Forrest unter allen denkbaren Umständen fehlerfrei funktioniert. Er sichert die konkret modellierten Fälle ab. Deshalb war der anschliessende **echte Spieltest** mit überlappenden MiniRobots zusätzlich wichtig.

## Node.js, Test-Runner und Testframework – nicht verwechseln

| Begriff | Aufgabe | Beispiel |
| --- | --- | --- |
| JavaScript | Programmiersprache | `const x = 1;` |
| Node.js | JavaScript ausserhalb des Browsers ausführen | `node hello.js` |
| Node-Test-Runner | Tests erkennen und ausführen | `node --test` |
| Assertions | Erwartete Ergebnisse kontrollieren | `assert.equal(...)` |
| Jest / Vitest | Zusätzliche Testframeworks bzw. Testwerkzeuge | Für grössere Projekte optional |
| npm | JavaScript-Pakete verwalten | `npm install` |

## Merksätze

> **Node.js führt JavaScript ohne Browser aus.** Testen ist eine seiner Möglichkeiten, nicht sein alleiniger Zweck.

> **Ein Test besteht aus Vorbereitung, Ausführung und Überprüfung.** (*Arrange – Act – Assert*)

> **Regressionstests sichern bekanntes Verhalten für spätere Änderungen ab.** Sie ergänzen praktische Spieltests, ersetzen sie aber nicht vollständig.

## Zum Nachschlagen

- Node.js – Einführung: https://nodejs.org/learn/getting-started/introduction-to-nodejs
- Node.js – eingebauter Test-Runner: https://nodejs.org/api/test.html
- Node.js – CommonJS-Module: https://nodejs.org/api/modules.html
- Angry Forrest – Testdatei im Fix-Branch: `tests/multi-robot-stomp.test.cjs`
