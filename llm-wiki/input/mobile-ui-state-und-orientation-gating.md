# Mobile UI-State und Orientation-Gating

## Grundidee

Bei responsiven Spielen reicht es nicht aus, einzelne Elemente anhand der Bildschirmgröße ein- oder auszublenden.

Es gibt mehrere voneinander unabhängige Fragen:

1. **Auf welchem Gerät läuft die Anwendung?**
2. **Welche Orientierung hat das Gerät?**
3. **In welchem Zustand befindet sich die Anwendung?**
4. **Welche UI darf in diesem Zustand sichtbar und bedienbar sein?**

Diese Fragen sollten nicht miteinander vermischt werden.

Ein mobiles Gerät im Hochformat ist beispielsweise etwas anderes als ein Desktop-Browser mit einem schmalen Fenster. Ebenso darf eine mobile Steuerung nicht allein deshalb sichtbar sein, weil das Gerät Touch unterstützt: Auf einer Landingpage existiert noch gar kein aktives Gameplay.

Die robuste Lösung besteht deshalb aus zwei Ebenen:

- Der **DOM besitzt bereits einen korrekten Initialzustand**.
- JavaScript verändert diesen Zustand später entsprechend dem aktuellen Game-State.

---

## 1. Der Initialzustand gehört ins HTML

Ein häufiger Fehler besteht darin, UI zunächst sichtbar zu rendern und sie anschließend durch JavaScript zu verstecken.

Beispiel:

```js
constructor(canvas, display) {
  this.canvas = canvas;
  this.display = display;

  this.display.setGameplayUiVisible(false);
}
```

Das funktioniert nur, sobald diese Klasse tatsächlich instanziiert wurde.

Wenn das Objekt aber erst nach einem Klick auf `START` erzeugt wird, existiert vorher ein Zeitraum, in dem die Gameplay-UI bereits sichtbar und eventuell sogar bedienbar ist.

Der bessere Ansatz lautet:

```html
<div class="bottom-controls" hidden>...</div>

<div class="character-energy" hidden>...</div>

<div class="robot-energy" hidden>...</div>
```

Der Browser kennt damit schon vor Ausführung irgendeines JavaScripts den korrekten Zustand.

### Allgemeine Regel

> Ein Element, das beim Laden der Seite nicht sichtbar sein soll, sollte bereits im HTML diesen Zustand besitzen.

JavaScript ist anschließend für **Zustandswechsel**, nicht für die nachträgliche Reparatur eines falschen Initialzustands zuständig.

---

## 2. `hidden` bedeutet auch: nicht bedienbar

Nur visuelle Transparenz oder `opacity: 0` reichen für UI-State nicht aus.

Ein unsichtbares Element könnte weiterhin:

- Fokus erhalten,
- Pointer-Events empfangen,
- Touch-Eingaben auslösen,
- für Screenreader eine falsche Situation darstellen.

Das HTML-Attribut `hidden` beschreibt dagegen tatsächlich einen UI-Zustand.

Dazu kann CSS explizit festhalten:

```css
.top-controls[hidden],
.bottom-controls[hidden],
.character-energy[hidden],
.robot-energy[hidden] {
  display: none;
}
```

Damit stimmen visuelle Darstellung und Bedienbarkeit überein.

---

## 3. Nicht jede UI gehört zum selben State

Bei Angry Forrest zeigte sich zusätzlich, dass nicht alle Controls gleichzeitig aktiviert werden sollten.

Es gibt mindestens drei relevante UI-Phasen:

```text
Landingpage
    ↓
Canvas-Intro / Vorbereitung
    ↓
Gameplay
```

Die gewünschte Sichtbarkeit kann beispielsweise so aussehen:

```text
Landingpage:
  Game-Controls        AUS
  Gameplay-Controls    AUS
  Energy-Bars          AUS

Intro:
  Option-Controls      AN
  Gameplay-Controls    AUS
  Energy-Bars          AUS

Playing:
  Option-Controls      AN
  Gameplay-Controls    AN
  Energy-Bars          AN
```

Dadurch wird deutlich, warum ein einziges

```js
setGameplayUiVisible(true);
```

nicht zwangsläufig für sämtliche UI-Elemente verantwortlich sein sollte.

Eine mögliche Trennung lautet:

```js
setGameplayUiVisible(visible) {
  const selectors = [
    ".character-energy",
    ".robot-energy",
    ".bottom-controls",
  ];

  selectors.forEach((selector) => {
    const element = document.querySelector(selector);

    if (element) {
      element.hidden = !visible;
    }
  });
}
```

und separat:

```js
setOptionControlsVisible(visible) {
  const topControls = document.querySelector(".top-controls");

  if (topControls) {
    topControls.hidden = !visible;
  }
}
```

Die Methoden benennen damit nicht nur **was technisch passiert**, sondern auch **welche Art von UI-Zustand verändert wird**.

---

## 4. Mobile Detection und Orientation sind zwei verschiedene Bedingungen

Eine zunächst naheliegende Lösung für einen Landscape-Hinweis wäre:

```js
prompt.hidden = this.isLandscape();
```

Das bedeutet jedoch:

> Jeder Portrait-Viewport benötigt Landscape.

Damit würde auch ein schmales Desktop-Fenster blockiert.

Die tatsächliche fachliche Bedingung lautet aber:

> Nur ein mobiles Gerät im Portrait-Modus benötigt den Landscape-Hinweis.

Deshalb wird zunächst Mobile unabhängig erkannt:

```js
isMobileDevice() {
  return window.matchMedia(
    "(hover: none) and (pointer: coarse)"
  ).matches;
}
```

Die Orientierung wird ebenfalls separat bestimmt:

```js
isLandscape() {
  return window.matchMedia(
    "(orientation: landscape)"
  ).matches;
}
```

Erst danach werden beide Informationen zur eigentlichen fachlichen Regel kombiniert:

```js
requiresLandscape() {
  return this.isMobileDevice() && !this.isLandscape();
}
```

---

## 5. Semantische Methoden statt technischer Bedingungen

Mit einer Methode wie

```js
requiresLandscape();
```

muss der aufrufende Code nicht mehr wissen, **wie** Mobile oder Landscape technisch erkannt werden.

Dadurch kann:

```js
updateOrientationPrompt() {
  const prompt = document.getElementById("orientation-prompt");

  if (!prompt) return;

  prompt.hidden = !this.requiresLandscape();
}
```

gelesen werden wie ein Satz:

```text
Verstecke den Hinweis,
wenn Landscape nicht erforderlich ist.
```

Das ist deutlich verständlicher als:

```js
prompt.hidden =
  !window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
  window.matchMedia("(orientation: landscape)").matches;
```

Obwohl beide Varianten technisch dasselbe ausdrücken könnten, enthält die erste Variante die **fachliche Bedeutung**.

---

## 6. Warum `requiresLandscape()` besser ist als `isLandscape()`

Diese beiden Methoden beantworten unterschiedliche Fragen.

```js
isLandscape();
```

fragt:

> Welche Orientierung hat der Viewport?

Dagegen fragt:

```js
requiresLandscape();
```

> Muss der Benutzer aufgrund der Regeln dieser Anwendung ins Querformat wechseln?

Das zweite ist eine **Policy-Entscheidung**.

Heute lautet diese Policy:

```js
return this.isMobileDevice() && !this.isLandscape();
```

Später könnte sie beispielsweise erweitert werden:

```js
requiresLandscape() {
  return (
    this.isMobileDevice() &&
    !this.isLandscape() &&
    this.isGameSurfaceActive()
  );
}
```

Der restliche Code müsste dafür nicht verändert werden.

---

## 7. Ein Overlay darf durchaus vor Spielstart erscheinen

Während Gameplay-Controls auf der Landingpage keinen Sinn ergeben, ist ein Orientation-Hinweis eine andere Art von UI.

Ein Landscape-Hinweis kann bereits vor dem eigentlichen Spielstart sinnvoll sein:

```text
Benutzer öffnet Spiel
        ↓
Gerät ist Mobile + Portrait
        ↓
"Please turn your device to landscape."
        ↓
Benutzer dreht Gerät
        ↓
Landingpage wird korrekt angezeigt
        ↓
START
```

Das verhindert, dass der Benutzer zunächst eine Oberfläche bedient und unmittelbar danach wegen einer Orientierungsanforderung unterbrochen wird.

Entscheidend ist deshalb nicht:

> Ist das Spiel bereits gestartet?

sondern:

> Ist diese Information bereits jetzt für den nächsten sinnvollen Schritt notwendig?

---

## 8. State statt Geräteeigenschaft

Ein wichtiges Ergebnis dieser Entwicklung ist die Erkenntnis:

> Geräteeigenschaften bestimmen, **welche UI grundsätzlich sinnvoll ist**.  
> Der Application-State bestimmt, **wann diese UI tatsächlich aktiv sein darf**.

Beispiel:

```text
Mobile
```

bedeutet nicht automatisch:

```text
Touch-Controls anzeigen
```

Stattdessen gilt:

```text
Mobile
+
Game-State === "playing"
=
Touch-Controls sinnvoll
```

Ebenso bedeutet:

```text
Portrait
```

nicht automatisch:

```text
Landscape-Warnung anzeigen
```

sondern:

```text
Mobile
+
Portrait
=
Landscape erforderlich
```

---

## 9. Ergebnis in Angry Forrest

Die Game-Lifecycle-States bilden bereits eine sinnvolle Grundlage:

```js
"intro";
"loading";
"starting";
"playing";
"gameOver";
"gameWon";
```

Gameplay-UI wird erst beim tatsächlichen Übergang zu `playing` aktiviert:

```js
finishWorldActivation() {
  this.startScene = null;
  this.state = "playing";
  this.display.setGameplayUiVisible(true);
}
```

Damit korrespondieren State und UI:

```text
intro/loading/starting
        ↓
Gameplay-UI verborgen

playing
        ↓
Gameplay-UI sichtbar
```

Die Landingpage liegt sogar noch vor der Erstellung des `Game`-Objekts. Deshalb muss ihr Initialzustand bereits durch HTML korrekt definiert sein.

---

## Merksätze

### Initialzustand

> HTML beschreibt den korrekten Zustand beim Laden. JavaScript beschreibt die späteren Zustandswechsel.

### Sichtbarkeit

> UI, die nicht verfügbar sein darf, sollte nicht nur unsichtbar, sondern tatsächlich deaktiviert bzw. verborgen sein.

### Device Detection

> Mobile, Touch, Bildschirmgröße und Orientierung sind unterschiedliche Eigenschaften und sollten nicht synonym verwendet werden.

### Semantik

> Fachliche Methoden wie `requiresLandscape()` sind wertvoller als wiederholt ausgeschriebene technische Bedingungen.

### Game-State

> Nicht das Gerät allein entscheidet, ob ein Control sichtbar ist. Entscheidend ist die Kombination aus Gerät, Anwendungszustand und Funktion des Controls.

### Architektur

> UI-State ist Teil der Application-State-Machine und nicht lediglich ein CSS-Problem.
