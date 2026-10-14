# DOM-Manipulation mit JavaScript: CSS-Eigenschaften und `clip-path`

## Allgemeine Erklärung

Das **DOM (Document Object Model)** stellt HTML-Elemente als Objekte bereit. JavaScript kann diese Elemente finden und ihre Darstellung verändern, ohne dafür das HTML neu zu schreiben.

```js
const element = document.getElementById("example");
element.style.opacity = "0.5";
```

- `document.getElementById("example")` sucht ein HTML-Element anhand seiner `id`.
- `.style` erlaubt den Zugriff auf dessen **Inline-CSS**.
- `.opacity = "0.5"` setzt den CSS-Wert direkt am Element.

CSS-Namen mit Bindestrich werden im JavaScript-`style`-Objekt normalerweise in **camelCase** geschrieben:

| CSS                | JavaScript              |
| ------------------ | ----------------------- |
| `clip-path`        | `style.clipPath`        |
| `background-color` | `style.backgroundColor` |
| `z-index`          | `style.zIndex`          |

`element.style` liest nicht automatisch die endgültigen Werte aus Stylesheets aus; dafür gibt es `getComputedStyle(element)`.

## Zwei Wege, eine Energiegrafik zu verändern

**Skalieren:** Ändert man `style.height`, wird das Bild bei abweichender automatischer Breiten-/Höhenberechnung unter Umständen gestreckt oder gestaucht. Im Boss-Robot von _Angry-Forrest_ wird die Höhe direkt angepasst und die obere Position nachgeführt:

```js
const height = (this.energy / 100) * 170;
energyBar.style.height = `${height}px`;
energyBar.style.top = `${202 - height}px`;
```

**Beschneiden:** Mit `clip-path` bleibt das Bild selbst gleich gross. Nur der _sichtbare Ausschnitt_ wird verändert. Die Grafik muss also nicht verzerrt werden.

```css
.energy-fill {
  clip-path: inset(50% 0 0 0);
}
```

`inset(oben rechts unten links)` schneidet hier **die obere Hälfte** weg. `0%` oben zeigt die ganze Grafik, `100%` oben zeigt nichts mehr. Der Bereich ausserhalb des Ausschnitts ist nicht sichtbar.

## Konkretes Beispiel: Character-Energie in Angry-Forrest

**HTML** (`index.html`): Zwei Grafiken liegen übereinander. Der Rahmen bleibt unverändert.

```html
<div class="character-energy" hidden>
  <img
    class="character-energy-fill"
    id="character-energy-bar"
    src="./img/character/char_energy.png"
    alt=""
  />
  <img
    class="character-energy-frame"
    src="./img/character/char-energy.png"
    alt=""
  />
</div>
```

**CSS** (`styles/game-hud.css`): Der Container ist der Bezugspunkt für die absolut positionierten Ebenen; der Rahmen liegt dank `z-index` darüber.

```css
.character-energy {
  position: absolute;
  width: 72px;
  height: 217px;
}

.character-energy-frame {
  position: absolute;
  inset: 0;
  width: 72px;
  height: 217px;
  z-index: 2;
}

.character-energy-fill {
  position: absolute;
  left: 22px;
  bottom: 20px;
  width: 26px;
  height: auto;
  z-index: 1;
  clip-path: inset(0 0 0 0);
}
```

**JavaScript** (`Character.updateCharacterEnergyBar()`):

```js
updateCharacterEnergyBar() {
  const energy = Math.max(0, Math.min(100, this.energy));
  const bar = document.getElementById("character-energy-bar");
  if (!bar) return;

  bar.style.clipPath = `inset(${100 - energy}% 0 0 0)`;
}
```

1. `Math.min(100, this.energy)` begrenzt den Höchstwert auf 100.
2. `Math.max(0, ...)` verhindert Werte unter 0.
3. `getElementById(...)` findet die Energiegrafik im DOM.
4. `if (!bar) return` verhindert einen Fehler, falls das Element fehlt.
5. `style.clipPath` legt den sichtbaren Ausschnitt fest.

| Energie | Clip oben | Wirkung                    |
| ------- | --------- | -------------------------- |
| 100     | 0 %       | Vollständig sichtbar       |
| 50      | 50 %      | Obere Hälfte ausgeblendet  |
| 10      | 90 %      | Nur unterste 10 % sichtbar |
| 0       | 100 %     | Komplett ausgeblendet      |

So sinkt der sichtbare Füllstand nach unten, **ohne dass der PNG-Rahmen gewechselt oder die Füllgrafik geometrisch verformt wird**.

## Wichtige Grenzen

- `clip-path` verändert **nicht** die Layout-Grösse des Bildes, sondern dessen sichtbaren Bereich.
- Für die Energiegrafik muss die Bildposition stimmen; transparente Ränder gehören weiterhin zur Bildfläche und werden beim prozentualen Beschneiden mitgerechnet.
- `style.clipPath` setzt einen Inline-Style, der eine entsprechende normale Stylesheet-Deklaration übersteuern kann.
- Eine Änderung am DOM wirkt erst, wenn das betreffende Element existiert.
- `clip-path` blendet keinen beliebigen inneren Flüssigkeitsstand aus, sondern beschneidet die gesamte Bildfläche. Bei einem runden unteren Ende kann die optische Anzeige deshalb etwas anders wirken als ein streng linearer Messbalken.

## Merksatz

**`.style.height` verändert die dargestellte Grösse; `.style.clipPath` verändert nur den sichtbaren Ausschnitt.** Für eine feste Rahmengrafik mit einer separaten Energie-Füllung kann Beschneiden daher die bessere Lösung sein.
