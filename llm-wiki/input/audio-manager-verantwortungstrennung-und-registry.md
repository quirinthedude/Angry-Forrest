# OOP-Lektion: AudioManager – Komposition, Registry und Ressourcenlebenszyklen

> **Stand:** Angry Forrest, Phase 3, Audio-Refactor bis einschliesslich **Etappe 8B.3** (10.10.2026). Die Änderungen aus 8B.3 sind laut Projektbericht committed. Die isolierten Prüfungen sind erfolgreich; ein zusätzlicher vollständiger Browsertest **nach** 8B.3 ist im hier zugrunde liegenden Verlauf noch nicht bestätigt. Frühere Browser-Integrationstests, einschliesslich Bosskampf, Bomben, VictoryScene und Restart, waren erfolgreich.  
> **Dokumenttyp:** Abgeschlossene Lernfassung zum implementierten Architekturstand, kein Vorschlag für noch ausstehende Umbauten.  
> **Quellenbasis:** Projektcode und die während der Audio-Refactor-Etappen geprüften Diffs/Testberichte. Konkrete Codeauszüge beziehen sich auf diesen Stand; bei späteren Codeänderungen erneut abgleichen.

## Lernziele

Nach dieser Lektion solltest du erklären können,

- weshalb das **Single Responsibility Principle (SRP)** und **Komposition** hier hilfreich sind;
- was eine **Factory-Methode**, eine **Registry** und eine **Invariante** sind;
- warum `Set` die **Identität einzelner Audioinstanzen** verwaltet und nicht bloss ihre Dateipfade;
- weshalb **Deregistrierung**, **Pausieren**, **Zurücksetzen** und **Objektentfernung** verschiedene Vorgänge sind;
- wie kurzlebige (**transiente**) Audioinstanzen mithilfe von `ended`, `error` und Promise-Rejections freigegeben werden;
- weshalb die **Cleanup-Reihenfolge** bei einem Restart entscheidend ist;
- wie eine **Single Source of Truth** die Mute-Steuerung vereinfacht.

## 1. Allgemeines Prinzip: Verantwortung ist nicht dasselbe wie Aktivität

Eine Klasse sollte nicht möglichst wenig _tun_, sondern für einen klar abgegrenzten Bereich **zuständig** sein. Das ist der Kern des **Single Responsibility Principle**: Eine Klasse soll nicht verschiedene, sachlich unabhängige Gründe haben, sich ändern zu müssen.

Vor dem Refactor war `Game` sowohl für den Spielablauf als auch für technische Audioverwaltung verantwortlich. Unter anderem durchsuchte es Character, Gegner und andere World-Objekte mit `Object.values()` nach Properties vom Typ `HTMLMediaElement`, um sie stummzuschalten oder zurückzusetzen.

Darin steckten zwei verschiedene Aufgaben:

1. **Fachliche Entscheidungen:** Wann beginnt die Titelmusik, wann die Spielmusik, wann die Trauer- oder Siegesmusik? Wann macht ein Gegner ein Geräusch?
2. **Technische Ressourcenverwaltung:** Wie wird ein Audioelement erzeugt, registriert, stummgeschaltet, zurückgesetzt und wieder aus der Verwaltung entlassen?

Die Lösung war keine neue Oberklasse für alle Spielobjekte, sondern eine kleine eigenständige Klasse: `AudioManager`.

**Komposition** bedeutet hier: `Game` erzeugt und besitzt einen `AudioManager` und **delegiert** technische Aufgaben an ihn. Andere Klassen erhalten über ihre bestehende `world.game`-Referenz Zugriff auf denselben Manager. `AudioManager` wiederum muss nicht wissen, was ein Bosskampf, ein Level oder ein Game Over ist.

| Beteiligte Klasse                          | Verantwortung im fertigen System                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------ |
| `Game`                                     | Spielzustand, Musikübergänge, Restart sowie UI und Persistenz des Mute-Werts         |
| `AudioManager`                             | Audioinstanzen erzeugen/registrieren, Mute-Zustand verwalten, Audio-Cleanup anbieten |
| `Character`, `Gnome`, `MiniRobot`, `Robot` | Auslöser ihrer Soundeffekte bestimmen; eigene Runtime-Ressourcen beenden             |
| `Bomb`                                     | Bombensound beim Erzeugen abspielen; Bombenbewegung und Schadensfenster verwalten    |
| `World`                                    | Actors und Bomben aktualisieren; deren Runtime beim World-Cleanup stoppen            |

**Merksatz:** Der AudioManager weiss, _wie_ Sounds verwaltet werden. Die Spielobjekte entscheiden, _wann_ sie erklingen.

## 2. Factory und Registry: Objekte explizit verwalten

Eine **Factory-Methode** bündelt die Erzeugung eines Objekts mitsamt nötiger Initialisierung. Eine **Registry** ist eine Sammlung der aktuell verwalteten Objekte.

Aus `js/models/AudioManager.class.js` (gekürzter Auszug):

```js
constructor(isMuted = false) {
  this.isMuted = isMuted;
  this.audioObjects = new Set();
  this.transientAudioObjects = new Set();
  this.transientCleanupListeners = new WeakMap();
}

createAudio(path) {
  return this.register(new Audio(path));
}

register(audio) {
  audio.muted = this.isMuted;
  this.audioObjects.add(audio);
  return audio;
}

setMuted(muted) {
  this.isMuted = muted;
  this.audioObjects.forEach((audio) => {
    audio.muted = muted;
  });
}
```

Hier gelten zwei wichtige **Invarianten**, also Eigenschaften, die die Architektur dauerhaft sicherstellen soll:

- Jede neu registrierte Audioinstanz übernimmt sofort `AudioManager.isMuted`.
- Ein Mute-Wechsel aktualisiert alle **noch registrierten** Instanzen.

### Warum ein `Set`?

```js
const first = audioManager.createAudio("./audio/bomb.mp3");
const second = audioManager.createAudio("./audio/bomb.mp3");

console.log(first === second); // false
```

Beide Sounds haben denselben Pfad, sind aber **verschiedene Audioobjekte**. Das erlaubt überlappende Effekte mehrerer Bomben. `Set` verhindert lediglich, dass _dieselbe Instanz_ zweimal eingetragen wird:

```js
audioManager.register(first);
audioManager.register(first); // unverändert nur ein Eintrag für first
```

Ein Cache nach Dateipfad hätte ein anderes Verhalten: Er könnte fälschlich dieselbe Wiedergabeinstanz für mehrere gleichzeitig auftretende Ereignisse wiederverwenden.

**Wichtig:** `Set` hält **starke Referenzen**. Ohne geplante Freigabe bleiben dynamisch erzeugte Audioinstanzen dort erhalten, selbst wenn sie nicht mehr über die Spielwelt erreichbar sind.

## 3. `unregister()` ist kein `pause()`

Bei der Ressourcenverwaltung müssen vier Begriffe unterschieden werden:

| Vorgang                                                    | Bedeutung                                                                      |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `audio.pause()`                                            | Unterbricht die Wiedergabe; entfernt das Objekt nicht aus der Registry         |
| `audio.currentTime = 0`                                    | Setzt die Abspielposition zurück                                               |
| `audioManager.unregister(audio)`                           | Beendet die Verwaltung dieser Instanz; hält die Wiedergabe selbst **nicht** an |
| Objekt aus `world.level.enemies` / `world.bombs` entfernen | Beendet dessen Teilnahme am Gameplay, nicht automatisch dessen Audio           |

Im fertigen `AudioManager` entfernt `unregister()` sowohl die normale Registrierung als auch allfälliges Transient-Tracking:

```js
unregister(audio) {
  this.removeTransientCleanupListeners(audio);
  this.transientAudioObjects.delete(audio);
  return this.audioObjects.delete(audio);
}
```

Die Methode ist **idempotent**: Ein zweiter Aufruf ist unproblematisch, weil `Set.delete()` auch dann sicher ist, wenn der Eintrag nicht mehr existiert. Der Rückgabewert beschreibt nur die Entfernung aus der Hauptregistry.

Die Trennung ist bewusst. Ein Todessound soll etwa ausklingen dürfen, obwohl sein Gegner längst aus dem Level verschwunden ist.

## 4. Warum Objektlebensdauer und Audiolebensdauer auseinanderfallen

Die zentrale Einsicht dieses Refactors lautet:

> **Die Lebensdauer eines Gameplay-Objekts bestimmt nicht automatisch die Lebensdauer seiner Ressourcen.**

Dafür gibt es in Angry Forrest zwei konkrete Beispiele: Bomben und MiniRobots.

### 4.1 Bomben: Eine neue Audioinstanz pro Explosion

Eine Bombe besitzt ein Flug-/Schadensfenster von insgesamt **1'250 ms** (`fuseTime = 750`, `damageDuration = 500`). Die verwendete MP3-Datei ist laut `ffprobe` ungefähr **1,104 Sekunden** lang. Normalerweise endet der Sound also vor der Entfernung der Bombe.

Das ist aber keine Garantie: Die Spielzeit wird anhand von `Date.now()` berechnet, während die Medienwiedergabe durch einen verzögerten Start oder einen gedrosselten Hintergrund-Tab hinterherhinken kann.

Die Bombe erhält deshalb keine einmalige Kopie eines Mute-Flags mehr, sondern den gemeinsamen `AudioManager`. Aus `Bomb.class.js`:

```js
this.explodingSound = audioManager.createTransientAudio("./audio/bomb.mp3");
this.explodingSound.currentTime = 0;
this.explodingSound
  .play()
  .catch(() => audioManager.unregister(this.explodingSound));
```

`Robot.throwBomb()` übergibt beim Erzeugen der Bombe `this.world.game.audioManager`.

Wenn `World.updateBombs()` eine fertige Bombe aus `world.bombs` entfernt, wird **nur das Bombenobjekt entfernt**. Der Sound bleibt, sofern noch aktiv, im AudioManager registriert. Damit ist er weiterhin per Mute steuerbar und wird bei einem Restart sicher gestoppt.

### 4.2 Was bedeutet _transientes_ Audio?

_Transient_ bezeichnet hier Audioinstanzen, deren Verwaltung nach einer einzelnen Wiedergabe **automatisch enden** soll.

Der Manager unterstützt sowohl neu erzeugte als auch bereits existierende Audioinstanzen:

```js
createTransientAudio(path) {
  return this.trackTransientAudio(new Audio(path));
}

trackTransientAudio(audio) {
  this.register(audio);
  if (this.transientAudioObjects.has(audio)) return audio;
  this.transientAudioObjects.add(audio);
  this.addTransientCleanupListeners(audio);
  return audio;
}
```

Drei Datenstrukturen erfüllen unterschiedliche Zwecke:

- `audioObjects: Set` – alle gegenwärtig verwalteten Audioinstanzen, auch reguläre Musik und Actor-Sounds.
- `transientAudioObjects: Set` – die Teilmenge kurzlebiger Sounds, für die ein eigenes Wiedergabeende relevant ist.
- `transientCleanupListeners: WeakMap` – Zuordnung einer Audioinstanz zu ihrem Cleanup-Callback, damit beide Listener gezielt entfernt werden können.

`trackTransientAudio()` ist für denselben laufenden Transient-Eintrag idempotent: Das erneute Tracking legt keine doppelten Listener an.

### 4.3 Ereignisgesteuertes Freigeben statt Polling

Die Listener werden genau beim Transient-Tracking gesetzt:

```js
addTransientCleanupListeners(audio) {
  const release = () => this.unregister(audio);
  this.transientCleanupListeners.set(audio, release);
  audio.addEventListener("ended", release, { once: true });
  audio.addEventListener("error", release, { once: true });
}
```

- `ended`: Der Sound hat sein natürliches Wiedergabeende erreicht.
- `error`: Ein Medienfehler wurde gemeldet.
- `.play().catch(...)`: Der Start der Wiedergabe wurde abgelehnt. Dann ist nicht darauf zu vertrauen, dass später `ended` eintritt.

`{ once: true }` begrenzt den jeweiligen Listener auf ein Ereignis. Die explizite Methode `removeTransientCleanupListeners(audio)` entfernt **beide** Listener auch dann, wenn nur einer davon ausgelöst wurde oder ein Restart den Sound vorher freigibt.

Eine `WeakMap` allein befreit jedoch keine Audioinstanz aus dem **stark referenzierenden** `Set`. Entscheidend ist der tatsächlich ausgeführte Cleanup über `unregister()`.

**Grenze:** Wenn die Wiedergabe weder endet noch einen Fehler meldet und auch die `play()`-Promise nicht fehlschlägt, bleibt der Eintrag möglicherweise bis zum Restart registriert. Das wurde bewusst ohne zusätzliche Watchdog-Timer gelöst.

## 5. MiniRobot: Runtime und Sound fachlich trennen

Der MiniRobot zeigt die umgekehrte Situation zur ursprünglich naiven Cleanup-Strategie: Er verschwindet sehr schnell aus dem Canvas, sein Todessound klingt aber noch weiter.

Beim Knockout wird seine **bereits existierende** `deathSound`-Instanz transient markiert. Anders als bei der Bombe soll dabei kein zweites `Audio`-Objekt entstehen.

Aus `MiniRobot.knockOut()` (Audio-Ausschnitt):

```js
const audioManager = this.world.game.audioManager;
audioManager.trackTransientAudio(this.deathSound);
this.deathSound.currentTime = 0;
this.deathSound.play().catch(() => audioManager.unregister(this.deathSound));
```

Bei der normalen Entfernung aus dem Level werden Runtime-Ressourcen und Jump-Sound freigegeben, **nicht** aber der noch ausklingende Todessound:

```js
stopRuntime() {
  clearInterval(this.movementInterval);
  this.stopAnimation();
}

removeFromLevel() {
  const index = this.world.level.enemies.indexOf(this);
  if (index !== -1) {
    this.world.level.enemies.splice(index, 1);
    this.stopRuntime();
    this.world.game.audioManager.unregister(this.jumpingSound);
  }
}
```

Der endgültige World-Cleanup ruft weiterhin `MiniRobot.stop()` auf. Dieser führt `stopRuntime()` aus und deregistriert beide Audioinstanzen. **Das Stoppen der Runtime ist aber nicht identisch mit einem sofortigen Abbruch des Todessounds.**

Im geprüften Projekt betrug die Todessound-Datei ungefähr **888 ms**. Für das Fallen bis zur Entfernung wurden etwa **250 ms** abgeschätzt. Der Ton kann folglich noch rund **600–650 ms** nach dem Entfernen des MiniRobots laufen. Die Werte sind Näherungen, keine Timing-Garantie.

**OOP-Lernpunkt:** Ein Objekt kann bereits aus einer Collection entfernt sein, während ein anderes Objekt – hier der AudioManager – eine seiner Ressourcen noch rechtmässig verwaltet.

## 6. Restart: Die Reihenfolge entscheidet

Vor der Bereinigung suchte `Game.returnToIntro()` nach `World.stop()` sämtliche Audio-Properties in noch erreichbaren Actors. Diese Reflection war nötig geworden, weil `World.stop()` ihre Sounds bereits aus der Registry deregistrierte.

Beim Entfernen der Reflection mussten wir deshalb **zuerst** den Ressourcen-Cleanup und **danach** das Actor-Cleanup ausführen.

Aus `Game.returnToIntro()`:

```js
this.audioManager.stopTransientAudio();
this.audioManager.pauseAndResetAll();
this.world?.stop();
```

Die zugehörigen Manager-Methoden:

```js
stopTransientAudio() {
  [...this.transientAudioObjects].forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
    this.unregister(audio);
  });
}

pauseAndResetAll() {
  this.audioObjects.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });
}
```

**Weshalb gerade diese Reihenfolge?**

1. **Transients stoppen und deregistrieren:** Erreicht auch Bomben und MiniRobot-Todessounds, deren Gameplay-Objekte bereits entfernt wurden.
2. **Verbleibende Registrierungen pausieren/zurücksetzen:** Erreicht Musik sowie alle noch registrierten Actor-Sounds.
3. **`World.stop()` ausführen:** Darf erst jetzt reguläre Actor-Sounds deregistrieren und Runtime-Timer freigeben.
4. **World-Referenz entfernen und Intro starten:** Nur die vier Game-Musikinstanzen bleiben dauerhaft im AudioManager.

Ein synchroner JavaScript-Aufruf wird nicht mitten zwischen diesen Anweisungen durch einen normalen Timer-Callback unterbrochen. Damit lässt sich die erforderliche Cleanup-Reihenfolge gezielt herstellen.

**Wichtig:** Game Over und Victory selbst lösen dieses globale Restart-Cleanup **nicht** aus. Bereits gestartete Effekte dürfen dort weiterhin ausklingen. Das Musik-Timing der Endsequenzen bleibt Sache von `Game`.

## 7. Single Source of Truth: Mute an genau einem Ort

Vor Etappe 8B.3 gab es zwei Werte: `Game.isMuted` und `AudioManager.isMuted`. Sie wurden jedes Mal synchronisiert.

Im fertigen Aufbau hat nur der Manager den Zustand. `Game` bleibt die öffentliche Schnittstelle für UI und Browser-Persistenz.

Aus `Game`:

```js
const isMuted = JSON.parse(localStorage.getItem("isMuted")) ?? false;
this.audioManager = new AudioManager(isMuted);

this.titleSong = this.audioManager.createAudio("/audio/title_song.mp3");
this.gameSong = this.audioManager.createAudio("./audio/game_song.mp3");
this.funeralSong = this.audioManager.createAudio(
  "./audio/Mourning Brass - 2.mp3",
);
this.endOfGameSong = this.audioManager.createAudio("./audio/end_of_game.mp3");

this.display.updateMuteUI(this.audioManager.isMuted);
```

Der Wert wird **vor** der Musikregistrierung gelesen. Deshalb entsteht kein Zeitraum, in dem die Musik erst falsch initialisiert und anschliessend korrigiert werden muss.

Mute-Änderungen erfolgen über genau eine Methode:

```js
setMuted(muted) {
  this.audioManager.setMuted(muted);
  localStorage.setItem("isMuted", JSON.stringify(this.audioManager.isMuted));
  this.display.updateMuteUI(this.audioManager.isMuted);
}
```

Die Beteiligten haben unterschiedliche Rollen:

- **AudioManager:** Autoritative Zustandsquelle (`isMuted`) und Anwendung auf alle registrierten Sounds.
- **Game:** Öffentliche Aktion `setMuted()` und Koordination von Persistenz und Darstellung.
- **`localStorage`:** Gespeicherter Wert für den nächsten Seitenaufruf; nach der Initialisierung kein konkurrierender Laufzeitzustand.
- **DisplayController:** Zeigt den aktuellen Zustand an; entscheidet ihn nicht selbst.

Eine neu erzeugte Bombe oder ein neuer Character-Sound übernimmt dank `register()` sofort den aktuellen Manager-Zustand. Die alte `applyMutedState()`-Methode entfällt.

## 8. Wie viel hat die Registry tatsächlich zu verwalten?

Im geprüften Level mit drei Gnomes und drei MiniRobots sind dies die regulären Soundinstanzen:

| Herkunft                                | Anzahl |
| --------------------------------------- | -----: |
| Game-Musik                              |      4 |
| Character                               |      5 |
| Drei Gnomes (je 1)                      |      3 |
| Drei MiniRobots (je 2)                  |      6 |
| Robot/Boss                              |      4 |
| **Summe bei vollständig aktiver World** | **22** |

Transiente Sounds kommen **zusätzlich** hinzu, solange sie laufen. Der registrierte Todessound eines noch aktiven MiniRobots wird beim Knockout lediglich als transient **markiert**, nicht ein zweites Mal gezählt.

Beispielhafte Invarianten aus den isolierten Tests:

| Situation                                 |              Hauptregistry |         Transient-Registry |
| ----------------------------------------- | -------------------------: | -------------------------: |
| Intro, ohne World                         |                          4 |                          0 |
| Vollständig aktive World, ohne Transients |                         22 |                          0 |
| Eine zusätzliche laufende Bombe           |                         23 |                          1 |
| Drei zusätzliche laufende Bomben          |                         25 |                          3 |
| Nach natürlichem Bombensound-Ende         | Wieder ohne diesen Eintrag | Wieder ohne diesen Eintrag |
| Nach `returnToIntro()`                    |                          4 |                          0 |

Bei einem entfernten MiniRobot bleibt vorübergehend seine **eine** Todessound-Instanz erhalten; Jump-Sound und Runtime werden schon bei der Entfernung freigegeben.

Wichtig ist nicht, dass immer genau 22 Sounds existieren. Wichtig ist, dass die Anzahl nach einem vollständigen Restart **nicht immer weiter anwächst**.

## 9. Was der Refactor entfernt hat

Die fertige Architektur braucht weder eine direkte Audioerzeugung in Gegner- oder Game-Klassen noch eine Suche nach beliebigen Audio-Properties:

- `new Audio(...)` liegt ausschliesslich im `AudioManager` (einschliesslich transienter Factory).
- `Game.getAudioObjects()` wurde entfernt.
- `Game.getGameAudioObjects()` wurde entfernt.
- `Game.getWorldAudioObjects()` wurde entfernt.
- `Game.addObjectAudio()` wurde entfernt.
- Die Audioerkennung mit `Object.values()` wurde entfernt.
- `Game.isMuted` und `Game.applyMutedState()` wurden entfernt.

Die alten Übergangslösungen waren während des inkrementellen Refactors nützlich, sind aber **kein Bestandteil der Zielarchitektur** mehr.

## 10. Was sich aus dem schrittweisen Refactor lernen lässt

1. **SRP (Single Responsibilty Principle):** Spielentscheidungen und technische Audioverwaltung haben verschiedene Änderungsgründe und dürfen getrennt werden.
2. **Komposition statt zentraler Allzuständigkeit:** Der `AudioManager` ist ein Dienstobjekt für Audioressourcen, kein zweiter Game-Controller.
3. **Factory und Registry:** Erzeugung, Registrierung und initialer Mute-Zustand werden an einer Stelle garantiert.
4. **Identität statt Dateiname:** Mehrere unabhängige Audioinstanzen können denselben Sound gleichzeitig abspielen.
5. **Explizites Ownership-/Lifecycle-Denken:** Wer Referenzen aufbewahrt, muss auch ihre spätere Freigabe planen.
6. **Entkopplung verschiedener Lebensdauern:** Bomben und MiniRobots können verschwinden, während Audio noch läuft.
7. **Eventgesteuerte Freigabe:** `ended` und `error` vermeiden eine Polling-Schleife; eine abgelehnte `play()`-Promise benötigt ihren eigenen Fehlerpfad.
8. **Reihenfolge ist Teil der Korrektheit:** Vor der Actor-Deregistrierung müssen Audioinstanzen zurückgesetzt sein.
9. **Single Source of Truth:** Nur `AudioManager.isMuted` bestimmt den Laufzeitzustand; Persistenz und UI spiegeln ihn.
10. **Inkrementelles Refactoring:** Kleine, einzeln testbare Schritte halten das Gameplay stabil und machen Architekturprobleme sichtbar, die bei einem grossen Umbau leicht übersehen würden.

## 11. Selbsttest – Fragen für das Verständnis

1. Weshalb würde ein `Map<soundPath, Audio>` die überlappenden Bombensounds nicht gleichwertig abbilden?
2. Was geschieht bei `unregister(audio)` ausdrücklich **nicht**, und wieso ist das für Todessounds nützlich?
3. Warum braucht `AudioManager` neben der Hauptregistry ein separates Transient-Set?
4. Weshalb genügt `{ once: true }` nicht, um nach einer fehlgeschlagenen Wiedergabe sämtliche Referenzen sicher freizugeben?
5. Weshalb wird `trackTransientAudio(this.deathSound)` beim MiniRobot verwendet, aber `createTransientAudio(path)` bei einer Bombe?
6. Warum wäre `world.stop()` **vor** `pauseAndResetAll()` beim Restart problematisch?
7. Was unterscheidet `Game.setMuted()` von `AudioManager.setMuted()`?
8. Weshalb bleibt nach einem Restart die Registry bei vier statt bei null Einträgen?
9. Warum ist eine `WeakMap` nicht gleichbedeutend mit einer automatischen Deregistrierung aus einem `Set`?
10. Welche Aspekte zeigen, dass dieses Refactoring das Gameplay möglichst unverändert gelassen hat?

## 12. Code-Navigation und Prüfstand

| Datei                             | Relevante Konzepte                                                                   |
| --------------------------------- | ------------------------------------------------------------------------------------ |
| `js/models/AudioManager.class.js` | Factory, normale/transiente Registry, Listener, Mute, Reset, Cleanup                 |
| `js/models/Game.class.js`         | Komposition, Single Source of Truth, Persistenz, Musikübergänge, Restart-Reihenfolge |
| `js/models/Character.class.js`    | Registrierung mehrerer Sounds; regulärer Actor-Cleanup                               |
| `js/models/Gnome.class.js`        | Registrierung und Freigabe des Todessounds                                           |
| `js/models/MiniRobot.class.js`    | Bestehendes Audio transient markieren; `stopRuntime()` vs. `stop()`                  |
| `js/models/Robot.class.js`        | Vier Boss-Sounds; Weitergabe des Managers an Bomben                                  |
| `js/models/Bomb.class.js`         | Eigenständiger transienter Sound; Playback-Rejection                                 |
| `js/models/World.class.js`        | Entfernen von Bomben und Actors; Cleanup ihrer Runtime                               |
| `index.html`                      | Ladefolge klassischer Scripts: `AudioManager` vor den abhängigen Klassen             |

**Dokumentierte Prüfungen:** `git diff --check`, `node --check` für betroffene Dateien, isolierte Mute-/Registry-/Lifecycle-Tests sowie erfolgreiche frühere Browserprüfungen von Bomben, MiniRobots, Musikübergängen und Restart. Der letzte Mute-Refactor (8B.3) wurde isoliert geprüft und committed; sein vollständiger finaler Browserdurchlauf ist hier nicht ausdrücklich protokolliert.

**Schlussgedanke:** Gute Objektorientierung bedeutet nicht, alles in Klassen aufzuteilen. Sie bedeutet, klare Zuständigkeiten zu schaffen, die Lebensdauer gemeinsam genutzter Ressourcen ausdrücklich zu behandeln und die Zusammenarbeit der Objekte so einfach zu halten, dass man sie verstehen und testen kann.
