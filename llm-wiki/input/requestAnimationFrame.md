# `requestAnimationFrame()` – Animationen im Browser zeichnen

## Grundidee

`requestAnimationFrame()` plant eine Funktion für die **nächste Bildaktualisierung des Browsers** ein.

```js
requestAnimationFrame(callback);
```

Der Browser führt `callback` aus, kurz bevor er das nächste Bild auf dem Bildschirm darstellt. Das eignet sich besonders für Canvas-Animationen, Spiele und andere visuelle Änderungen.

Ein vereinfachter Ablauf sieht so aus:

```text
JavaScript plant Zeichenfunktion ein
        ↓
Browser bereitet das nächste Bild vor
        ↓
Zeichenfunktion wird ausgeführt
        ↓
Browser zeigt das neue Bild an
```

Auf Bildschirmen mit 60 Hz passiert das häufig ungefähr 60-mal pro Sekunde. Das ist aber keine Garantie: Die tatsächliche Häufigkeit hängt unter anderem vom Gerät, der Auslastung und der Bildwiederholrate des Displays ab.

---

## Ein einzelnes Bild anfordern

```js
requestAnimationFrame(() => {
  console.log("Das nächste Bild wird vorbereitet");
});
```

Dieser Aufruf führt die Funktion **genau einmal** aus. `requestAnimationFrame()` startet also nicht von selbst eine dauerhafte Schleife.

Für eine Animation muss am Ende der Zeichenfunktion das nächste Bild angefordert werden:

```js
function draw() {
  // aktuelles Bild zeichnen

  requestAnimationFrame(draw);
}

draw();
```

Das ist eine kontrollierte, fortlaufende Zeichenschleife:

```text
draw()
  ↓
Bild zeichnen
  ↓
nächstes draw() für das nächste Browser-Bild einplanen
  ↓
Browser ruft draw() wieder auf
```

Wichtig: Die Funktion ruft sich nicht sofort selbst auf. Sie wird nur für einen späteren Zeitpunkt beim Browser registriert. Deshalb wächst dabei auch nicht der Aufruf-Stack.

---

## Beispiel aus `World.class.js`

In der `World` wird die Zeichenschleife im Konstruktor gestartet:

```js
constructor(canvas) {
  this.canvas = canvas;
  this.ctx = canvas.getContext("2d");

  this.character = new Character(this);

  this.draw();
}
```

`this.draw()` zeichnet zunächst ein Bild. In der Methode werden die Objekte in einer festen Reihenfolge gezeichnet:

```js
draw() {
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

  this.drawObject(this.sky);
  this.drawObjects(this.backgroundobject);
  this.drawObject(this.character);
  this.drawObjects(this.enemies);
  this.drawObjects(this.grass);
  requestAnimationFrame(() => this.draw());
}
```

Die einzelnen Schritte sind:

1. `clearRect()` entfernt das vorherige Canvas-Bild.
2. Himmel, Hintergrund, Character, Gegner und Gras werden an ihren aktuellen Positionen gezeichnet.
3. `requestAnimationFrame()` plant das nächste `draw()` ein.
4. Beim nächsten Browser-Bild beginnt der Ablauf wieder bei Schritt 1.

Dadurch werden Positionsänderungen sichtbar. Wenn sich beispielsweise `this.character.x` zwischen zwei Durchläufen ändert, wird der Character beim nächsten Zeichnen an der neuen X-Position dargestellt.

---

## Warum wird das Canvas zuerst geleert?

Ein Canvas merkt sich, was bereits gezeichnet wurde. Ohne `clearRect()` bliebe das alte Bild sichtbar:

```js
this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
```

Das Löschen des gesamten Canvas vor jedem neuen Bild verhindert bei bewegten Objekten sichtbare Spuren:

```text
altes Bild entfernen
→ alle Objekte mit ihren aktuellen Werten zeichnen
→ neues vollständiges Bild anzeigen
```

---

## Warum wird eine Arrow Function verwendet?

```js
requestAnimationFrame(() => this.draw());
```

Die Arrow Function bewahrt hier den Wert von `this`. Er bleibt das aktuelle `World`-Objekt.

Ohne Arrow Function wäre das problematisch:

```js
requestAnimationFrame(this.draw);
```

Der Browser ruft die übergebene Methode dann als Callback auf. Dabei ist nicht mehr sichergestellt, dass `this` innerhalb von `draw()` auf die `World` zeigt. Zugriffe wie diese könnten deshalb fehlschlagen:

```js
this.ctx.clearRect(...);
```

Die Arrow Function ruft dagegen ausdrücklich die Methode der aktuellen World auf:

```js
() => this.draw()
```

---

## Unterschied zu `setInterval()`

Auch mit `setInterval()` könnte eine Zeichenfunktion regelmäßig ausgeführt werden:

```js
setInterval(draw, 1000 / 60);
```

Für Bildschirm-Animationen ist `requestAnimationFrame()` meistens die bessere Wahl, weil der Browser die Ausführung an seine Bildaktualisierung anpasst. In inaktiven Tabs wird sie in der Regel pausiert oder stark gedrosselt. Das spart Rechenleistung und Energie.

`requestAnimationFrame()` ist jedoch für das **Zeichnen** gedacht. Wenn Spielbewegungen auf allen Geräten gleich schnell sein sollen, sollte die Bewegungsberechnung zusätzlich die vergangene Zeit berücksichtigen, statt pro Bild immer denselben Weg zurückzulegen.

---

## Animation anhalten

`requestAnimationFrame()` gibt eine ID zurück. Mit ihr kann ein bereits geplanter nächster Durchlauf abgebrochen werden:

```js
let animationId;

function draw() {
  // zeichnen
  animationId = requestAnimationFrame(draw);
}

function stop() {
  cancelAnimationFrame(animationId);
}
```

In der aktuellen `World` wird die Schleife nicht angehalten, weil die Spielwelt durchgehend gezeichnet werden soll.

---

## Merksatz

> `requestAnimationFrame()` sagt dem Browser: „Führe diese Zeichenfunktion vor dem nächsten sichtbaren Bild aus.“

Erst das erneute Anfordern am Ende von `draw()` macht daraus eine kontinuierliche Animation.
