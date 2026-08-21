# World-/Level-Ownership-Refactor

## Git-Ausgangszustand

- HEAD vor dem Refactor: `6a9be4fe9135f84eb8d58be44ebd2a431787388f`
- `git status --short`: leer
- Der Worktree enthielt vor Beginn keine uncommitted Änderungen.

## Vorherige Architektur

```text
global level1
    ↓
Bewohner entstehen
    ↓
später World
```

`level1` wurde beim Laden des Scripts als fertige globale `Level`-Instanz
erzeugt. Dadurch entstanden `Golem` und `Robot`, bevor die gemeinsame
`World`-Instanz existierte. Aktive Bewohner hätten ihre World-Referenz deshalb
nachträglich erhalten müssen.

## Verworfene Zwischenlösung

Eine funktional korrekte Zwischenlösung wäre beispielsweise:

```js
setWorld(world) {
  this.world = world;
}
```

Das erklärt zwar Dependency Injection und Referenzen, verteilt die
Initialisierung aber auf zwei Schritte. Diese Lösung wurde zugunsten einer
klareren Ownership-Struktur nicht übernommen.

## Neue Architektur

```text
World
  ↓ owns
Level
  ↓ contains
aktive Bewohner
  ↘ reference back to World
```

`level1.js` stellt jetzt `createLevel1(world)` bereit. `World` erzeugt sein
Level im Constructor und übergibt sich dabei an die aktiven Bewohner. Erst
danach wird der `Character` erzeugt.

Ownership bedeutet hier: `World` besitzt und verwaltet ihr `Level`, und das
`Level` enthält seine Objekte. Eine Referenz bedeutet: Ein aktiver Bewohner
kennt seine umgebende World, um später mit ihr interagieren zu können. Das ist
keine Vererbung; weder `Level` noch Bewohner leiten sich von `World` ab.

Aktive Objekte dürfen die World kennen, weil sie künftig Weltzustand lesen und
auf Ereignisse reagieren können. Passive Grafikobjekte wie `Sky`, `Grass`,
`BackgroundObject` und Landscape-Tiles benötigen diese Referenz nicht und
erhalten sie deshalb nicht.

## Geänderte Dateien

- `js/levels/level1.js`: globale Level-Instanz durch `createLevel1(world)` ersetzt.
- `js/models/World.class.js`: Level-Erzeugung und Zugriffe über `world.level`.
- `js/models/Character.class.js`: Bewegungsgrenze über `world.level.landscape`.
- `js/models/Robot.class.js`: World-Referenz im Constructor.
- `js/models/Golem.class.js`: World-Referenz im Constructor.
- `llm-wiki/input/world-level-ownership-refactor.md`: diese Dokumentation.

## Vorbereitete Funktionen

Die Struktur schafft die Grundlage für:

- Robot-Aktivierung anhand der Character-Position (`world.character.x`)
- Collision Detection zwischen Objekten derselben World
- Gegner-KI und Verfolgung

Diese Funktionen sind in diesem Refactor noch nicht implementiert.

## Initialisierungsreihenfolge

1. `World` erhält Canvas und Zeichenkontext.
2. `World` ruft `createLevel1(this)` auf.
3. `Level` und aktive Bewohner entstehen; Golem-/Robot-Referenzen zeigen
   bereits auf diese World.
4. `Character` entsteht mit derselben World-Referenz.
5. Die Zeichen-Loop startet.

Die bestehende Golem-Bewegung greift nicht auf `world.character` zu und darf
daher bereits in Schritt 3 starten. Character-Bewegungslogik läuft erst nach
seiner Erzeugung; zu diesem Zeitpunkt ist das Level bereits vorhanden.
