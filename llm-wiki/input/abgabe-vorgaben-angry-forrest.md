# Abgabevorgaben für Angry Forrest

## Zweck dieses Dokuments

Dieses Dokument überträgt die Checkliste **„El Pollo Loco / Sharkie – Jump and Run“** auf das Projekt **Angry Forrest**. Es dient als Wissensquelle für Fragen wie:

- „Ist das Kriterium Mobile-Ansicht erfüllt?“
- „Welche Abgabevorgaben sind noch offen?“
- „Wo im Code wird die Boss-Statusbar umgesetzt?“
- „Welche Kriterien sind nur teilweise erfüllt?“

Die Checkliste erlaubt ausdrücklich ein eigenes Spielkonzept. Bewertet werden deshalb die geforderten Eigenschaften, nicht die Übernahme von El Pollo Loco oder Sharkie.

## Statusbegriffe

- **Erfüllt:** Im Repository ist eine passende Umsetzung erkennbar.
- **Teilweise erfüllt:** Ein Teil der Anforderung ist vorhanden, aber mindestens ein Teil fehlt oder ist noch nicht abgesichert.
- **Offen:** Die Umsetzung ist im aktuellen Repository nicht erkennbar.
- **Nicht belegbar:** Der Punkt kann aus dem Repository allein nicht zuverlässig beurteilt werden und braucht einen manuellen Test oder einen Nachweis außerhalb des Codes.

Der Status beschreibt den zuletzt geprüften Repository-Stand. Er ist keine Garantie für fehlerfreies Verhalten auf jedem Gerät.

## 1. Allgemeine Abgabevorgaben

### Git-Workflow

| Kriterium | Status | Begründung |
| --- | --- | --- |
| GitHub von Anfang an verwenden | **Erfüllt** | Das Repository besitzt ein GitHub-Remote auf `github.com/quirinthedude/Angry-Forrest`. |
| Nach jeder Coding-Session committen | **Nicht belegbar** | Die Commit-Historie ist vorhanden, aber die Einhaltung jeder Coding-Session lässt sich daraus nicht sicher ableiten. |
| Aussagekräftige Commit-Messages | **Teilweise erfüllt** | Die jüngsten Messages sind überwiegend beschreibend, zum Beispiel `integrated robot fight sfx` und `docs: update world update architecture todo`. Eine vollständige Qualitätsbewertung aller Commits steht noch aus. |
| `.gitignore` verwenden | **Erfüllt** | `.gitignore` schließt unter anderem `scripts/`, `.agents/` und den lokalen Wiki-Index aus. |
| Repository aktuell und gepflegt halten | **Teilweise erfüllt** | Struktur und Historie sind vorhanden; `README.md` ist jedoch noch sehr knapp und offene TODOs existieren. |

### Funktionalität

| Kriterium | Status | Begründung |
| --- | --- | --- |
| Alle Links und Buttons funktionieren | **Offen** | Im aktuellen `index.html` gibt es keine regulären Spielbuttons oder Links. Der Start erfolgt über das anklickbare `.pre-intro`-Element und die Tastatur. |
| Keine Konsolenfehler und keine `console.log`-Ausgaben | **Offen** | Mehrere Debug-Ausgaben befinden sich noch im Code, unter anderem in `Character.class.js`, `Robot.class.js` und `World.class.js`. |

### Design

| Kriterium | Status | Begründung |
| --- | --- | --- |
| Eigenständiges, passendes Design | **Erfüllt** | Angry Forrest besitzt eine eigene Waldoptik, Startscreen-Grafiken, Canvas-Rahmen und eigene Gegner-/Bossgrafiken. |
| Schriftart passend ausgewählt und lokal eingebunden | **Offen** | Eine lokale Schriftdatei oder `@font-face`-Definition ist aktuell nicht vorhanden. |
| Favicon vorhanden | **Erfüllt** | `index.html` bindet mehrere Größen von `img/icons/AF-48.png` sowie ein Apple-Touch-Icon ein. |
| Buttons besitzen `cursor: pointer` | **Offen** | Es gibt noch keine regulären HTML-Buttons; für die spätere UI muss dieses Kriterium gezielt geprüft werden. |

### Responsiveness und Mobile

| Kriterium | Status | Begründung |
| --- | --- | --- |
| Desktop-Ansicht funktioniert | **Teilweise erfüllt** | Der Startscreen und das Spiel laden im Desktop-Smoke-Test. Eine vollständige Funktionsprüfung aller Spielabläufe steht noch aus. |
| Mobile Nutzung nur im Querformat | **Offen** | Eine Hochformatmeldung und eine Orientierungsprüfung sind im HTML/CSS/JavaScript nicht erkennbar. |
| Mobile-Touch-Buttons nur auf kleinen Geräten sichtbar | **Offen** | Touch-Buttons sind aktuell nicht vorhanden. |
| Kein Scrollbalken bei kleinen Auflösungen | **Teilweise erfüllt** | `body` verwendet `overflow: hidden`, aber das feste Spielformat von `866px × 618px` ist nicht responsiv abgesichert. |
| Touch-Buttons funktionieren auf Smartphone und Tablet | **Offen** | Keine Touch-Steuerung vorhanden. |
| Kontextmenü der Touch-Buttons deaktiviert | **Offen** | Keine Touch-Buttons und kein passender Kontextmenü-Handler vorhanden. |

## 2. Technische Umsetzung und Clean Code

| Kriterium | Status | Begründung |
| --- | --- | --- |
| Beschreibende und konsistente Dateinamen | **Teilweise erfüllt** | Die Struktur ist grundsätzlich nachvollziehbar. Historisch gewachsene Namen wie `Thrownfruit.class.js` und gemischte Schreibweisen bei Asset-Ordnern sollten vor der Abgabe nochmals geprüft werden. |
| Hauptseite heißt `index.html` | **Erfüllt** | Die Hauptseite liegt als `index.html` im Repository-Wurzelverzeichnis. |
| Klassen liegen in einem eigenen Ordner | **Erfüllt** | Die Klassen liegen in `js/models/`; die Checkliste fordert einen separaten Klassenordner, was damit erfüllt ist. |
| Eine Funktion hat nur eine Aufgabe | **Teilweise erfüllt** | Die Verantwortlichkeiten wurden in mehrere Klassen und Methoden aufgeteilt. Die Update-Kette läuft jedoch weiterhin über den 60-FPS-Takt in `Character.moveCharacter()`, was im Wiki als offener Architekturpunkt dokumentiert ist. |
| Funktionen sind höchstens 14 Zeilen lang, HTML ausgenommen | **Offen** | Im aktuellen JavaScript gibt es mehrere längere Methoden, zum Beispiel `Character.moveCharacter()` und `World.drawObject()`. |
| Klare Datei-, Funktions- und Variablennamen | **Teilweise erfüllt** | Viele Namen sind verständlich; einzelne historische Schreibweisen und verkürzte Namen bestehen weiter. |
| Variablen und Funktionen beginnen kleingeschrieben | **Erfüllt** | Klassen und Konstanten ausgenommen beginnen Methoden- und Variablennamen im aktuellen JavaScript kleingeschrieben. |
| Ein bis zwei Leerzeilen zwischen Funktionen | **Teilweise erfüllt** | Die Dateien sind überwiegend lesbar formatiert; dies wurde noch nicht als automatischer Formatierungscheck abgesichert. |
| Höchstens 400 Zeilen pro Datei | **Erfüllt** | Die längste aktuelle JavaScript-Datei ist `Character.class.js` mit weniger als 400 Zeilen. |
| `index.html`, `script.js`, `style.css` korrekt benannt | **Teilweise erfüllt** | `index.html` und `style.css` sind vorhanden. Die JavaScript-Struktur verwendet mehrere thematisch getrennte Dateien statt einer zentralen `script.js`. |
| HTML gegebenenfalls in eigene Funktionen auslagern | **Teilweise erfüllt** | Die statische HTML-Grundstruktur ist direkt in `index.html`; dynamische UI-Elemente sind bisher nur begrenzt vorhanden. |
| Eigene Ordner für Templates und Bilder | **Teilweise erfüllt** | `img/` ist vorhanden. Ein eigener `templates/`-Ordner ist nicht erkennbar; für dieses Spiel ist bisher auch kein Template-System sichtbar. |
| Statisches HTML nicht über JavaScript generieren | **Erfüllt** | Die vorhandene HTML-Grundstruktur steht in `index.html`; JavaScript generiert sie nicht dynamisch. |
| Funktionen nach JSDoc dokumentieren | **Teilweise erfüllt** | Mehrere zentrale Klassen und Methoden besitzen JSDoc, aber nicht jede Funktion ist dokumentiert. |

## 3. Häufige Fehler aus der Checkliste

| Prüffrage | Status | Begründung |
| --- | --- | --- |
| Animationen sind passend getaktet | **Teilweise erfüllt** | Viele Sprite-Animationen und Geschwindigkeiten sind vorhanden. Die finale Balance und das visuelle Timing benötigen einen manuellen Spieletest. |
| Keine Lücken zwischen Hintergrundbildern | **Teilweise erfüllt** | Die Landschaft verwendet wiederholte Tiles und Parallax-Faktoren. Eine vollständige Prüfung entlang der gesamten Strecke steht noch aus. |
| Anzahl der Gegner passend | **Teilweise erfüllt** | Es gibt mehrere Gnome und einen Robot-Boss. Die endgültige Schwierigkeit muss im Spiel getestet werden. |
| Gegner nicht zu stark oder zu schwach | **Nicht belegbar** | Schaden, Cooldowns und Bossenergie sind im Code erkennbar, die Spielbalance benötigt aber einen manuellen Test. |
| Gegner sterben nur bei echtem Treffer von oben | **Offen** | Die aktuelle Trefferlogik für den Charakter behandelt Gegnerkontakt allgemein; eine belastbare Sprung-von-oben-Prüfung für besiegbare Gegner ist nicht dokumentiert. |
| Statusbars aktualisieren korrekt | **Teilweise erfüllt** | Charakter- und Bossenergie werden im Code aktualisiert. Die korrekte Darstellung in allen Zuständen muss noch getestet werden. |
| Charakter ist nach dem Ableben unbeweglich | **Erfüllt** | `Character.characterDies()` setzt `isDead`, stoppt die Animation und beendet die weitere Bewegungsverarbeitung. |
| Sounds starten und stoppen korrekt | **Teilweise erfüllt** | Titel-, Spiel-, Lauf-, Treffer-, Bomben- und Boss-Sounds sind angebunden. Eine zentrale Soundsteuerung fehlt noch. |
| Mute-Button stoppt alle Sounds | **Offen** | Kein Mute-Button und keine zentrale Stummschaltung vorhanden. |
| Mute-Status wird im Local Storage gespeichert | **Offen** | `localStorage` wird im aktuellen Spielcode nicht verwendet. |
| Neustart nach Game Over ohne Seiten-Reload | **Offen** | Der Game-Over-Zustand wird angezeigt; ein vollständiger Neustartablauf ist noch nicht umgesetzt. |
| Mobile Buttons funktionieren | **Offen** | Touch-Steuerung fehlt. |
| Impressum enthält echte Daten | **Offen** | Eine Impressumsseite oder ein Impressumslink ist im aktuellen Repository nicht vorhanden. |

## 4. User Story: Spielerklärung und Landingpage

| Kriterium | Status | Begründung |
| --- | --- | --- |
| Ansprechende Landingpage mit Erklärung | **Teilweise erfüllt** | Es gibt einen eigenständigen Pre-Intro-Startscreen mit Titelbild und „Click to Start!“. Eine Erklärung per Dialog fehlt. |
| Thematisches Hintergrundbild | **Erfüllt** | Der Startscreen und die Spielseite verwenden passende Waldgrafiken. |
| Schriftart angepasst | **Offen** | Keine lokal eingebundene Projekt-Schrift ist erkennbar. |
| Tastenbelegung nachschlagbar | **Teilweise erfüllt** | Die Intro-Laufschrift erwähnt die Pfeiltasten; eine vollständige Übersicht einschließlich Springen und Werfen fehlt. |
| Optionale Story-Erklärung | **Offen** | Keine Story-Erklärung ist vorhanden. |
| Optionaler Fullscreen-Modus | **Offen** | Kein Fullscreen-Button oder Fullscreen-Aufruf vorhanden. |

## 5. User Story: Spielablauf

| Kriterium | Status | Begründung |
| --- | --- | --- |
| Spiel startet über eine Startaktion | **Erfüllt** | Der Pre-Intro-Screen startet das Spiel per Klick; Enter wird im Intro zusätzlich verarbeitet. |
| Start nicht direkt von Gegnern überrannt | **Teilweise erfüllt** | Gegnerpositionen sind im Level verteilt und der Boss wird erst in Character-Nähe aktiviert. Die Schwierigkeit muss noch manuell geprüft werden. |
| Gleichmäßiger Hintergrund ohne Lücken | **Teilweise erfüllt** | Parallax-Tiles sind eingerichtet; vollständiger Laufzeittest fehlt. |
| Hintergrundmusik und Soundeffekte | **Teilweise erfüllt** | Musik und mehrere Effekte sind vorhanden. Die geforderte Mute-Steuerung fehlt. |
| Mute-Status in `localStorage` | **Offen** | Nicht implementiert. |
| Endscreen bei Sieg und Niederlage | **Teilweise erfüllt** | Game Over ist vorhanden. Ein eigenständiger Win-Endscreen fehlt; der Boss-Tod führt aktuell ebenfalls über `endGame()` in den Game-Over-Fluss. |
| Restart und Rückkehr zum Home-Screen | **Offen** | Beide vollständigen Abläufe fehlen. |

## 6. User Story: Charakter

| Kriterium | Status | Begründung |
| --- | --- | --- |
| Flüssige Sprunganimation | **Erfüllt** | Eine eigene Jump-Spritefolge und vertikale Bewegungslogik sind vorhanden. |
| Flüssige Idle-, Lauf-, Hurt- und Angriffsanimationen | **Teilweise erfüllt** | Die Spritefolgen und Zustandswechsel existieren; finales Timing und Zusammenspiel müssen noch manuell geprüft werden. |
| Idle-Animation vorhanden | **Erfüllt** | `IMAGES_IDLE` ist in `Character.class.js` definiert und wird als Standardanimation verwendet. |
| Sleep-Animation spätestens nach 15 Sekunden | **Offen** | Eine Sleep-Animation oder ein entsprechender Timer ist nicht erkennbar. |
| Früchte sammeln und Anzeige aktualisieren | **Erfüllt** | Früchte werden aus dem Level entfernt, im Inventar gezählt und die drei Slots werden aktualisiert. |
| Früchte werfen | **Erfüllt** | `throwFruit()` erzeugt `ThrownFruit`-Objekte und zieht sie aus dem Inventar ab. |
| Normale Gegner durch Treffer besiegen | **Erfüllt** | Gnome reagieren auf Treffer mit `hitByFruit()`. |
| Endboss durch Treffer beschädigen | **Erfüllt** | Früchte werden in `World.checkThrownFruitCollisions()` an `Robot.hitByFruit()` weitergereicht. |
| Statusbar des Endbosses reduzieren | **Erfüllt** | `Robot.hitByFruit()` reduziert die Energie und `updateRobotEnergyBar()` aktualisiert die Anzeige. |
| Charakter- und Aktionssounds | **Teilweise erfüllt** | Mehrere Sounds sind vorhanden; ein vollständiger Sound-/Mute-Test steht aus. |
| Charakter verliert bei leerer Statusbar | **Erfüllt** | `takeDamage()` reduziert Energie und ruft bei null `characterDies()` auf. |

## 7. User Story: Gegner und Endboss

| Kriterium | Status | Begründung |
| --- | --- | --- |
| Mindestens zwei verschiedene normale Gegnertypen plus Endboss | **Offen** | Aktuell sind Gnome als normaler Gegnertyp und Robot als Boss vorhanden. Ein zweiter normaler Gegnertyp ist nicht erkennbar. |
| Endboss ist stärker als normale Gegner | **Teilweise erfüllt** | Der Robot besitzt eigene Energie, Bomben, mehrere Angriffsanimationen und Boss-Sounds. Die Schwierigkeit muss noch gespielt und abgestimmt werden. |
| Gegneranimationen für Idle, Hurt und Tod | **Teilweise erfüllt** | Gnome besitzen Idle-, Lauf- und Hurt-/Knockout-Animationen; der Robot besitzt umfangreiche Kampf- und Death-Animationen. Die finale Darstellung muss getestet werden. |
| Gegner sterben nur bei Sprung von oben, wenn das vorgesehen ist | **Offen** | Eine entsprechende Top-Kollision ist im aktuellen Code nicht ausreichend belegt. |
| Kollisions-Offsets passen | **Teilweise erfüllt** | Mehrere Klassen definieren Offsets. Die Werte müssen durch tatsächliche Sprung-, Treffer- und Randfälle geprüft werden. |
| Gegner besitzen passende Animationssounds | **Teilweise erfüllt** | Gnome- und Robot-Sounds sind vorhanden; die vollständige Zuordnung und Lautstärke ist noch nicht abgenommen. |
| Boss-Choreographie besitzt klare Zustände | **Erfüllt** | Der Robot verwendet `prepareAttack`, `charge` und `waiting`. Das lokale Wiki erklärt dieses Muster in `gameplay-state-machine-statt-dauerbedingung.md`. |
| Bosskampf endet mit eindeutigem Sieg | **Offen** | `Robot.die()` ruft nach der Death-Animation `world.game.endGame()` auf; `Game` unterscheidet aktuell nicht zwischen Sieg und Niederlage. |

## 8. User Story: Mobile Nutzung

| Kriterium | Status | Begründung |
| --- | --- | --- |
| Im Querformat auf Mobilgeräten spielbar | **Offen** | Keine responsive Spielfläche oder Touchsteuerung vorhanden. |
| Extra Buttons nur in der Mobilansicht | **Offen** | Nicht vorhanden. |
| Kontextmenü auf den Touch-Buttons deaktiviert | **Offen** | Nicht vorhanden. |
| Hochformat zeigt Drehhinweis | **Offen** | Keine Orientation-Abfrage oder Hochformatmeldung vorhanden. |

## 9. User Story: Impressum

| Kriterium | Status | Begründung |
| --- | --- | --- |
| Impressum über einen Link erreichbar | **Offen** | In `index.html` existiert aktuell kein Impressumslink und keine separate Impressumsseite. |
| Anbieterinformationen und rechtliche Hinweise vorhanden | **Offen** | Keine entsprechenden Inhalte im Repository vorhanden. |

## 10. Aktuelle Priorisierung

Die wichtigsten offenen Kriterien in sinnvoller Reihenfolge:

1. **Siegzustand des Bosskampfs:** `Robot.die()` muss in einen echten Win-Fluss führen, getrennt von Game Over.
2. **Restart und Home:** Beide Endzustände brauchen einen funktionierenden Benutzerfluss.
3. **Mobile Querformat- und Touch-Steuerung:** Dieser Block umfasst mehrere Pflichtkriterien gleichzeitig.
4. **Mute-System:** Alle Audioobjekte zentral steuerbar machen und den Status in `localStorage` speichern.
5. **Zweiter normaler Gegnertyp:** Damit die Mindestanforderung „zwei Gegnertypen plus Endboss“ erfüllt wird.
6. **Impressum und UI:** Impressumsseite, Tastenübersicht und reguläre Buttons ergänzen.
7. **Abgabe-Cleanup:** `console.log`s, Debug-Kollisionsrahmen, offene TODOs und fehlende JSDoc-Dokumentation bereinigen.

## 11. Wichtige Belegstellen im Repository

- Spielstart und Lebenszyklus: `js/models/Game.class.js`
- Rendering, Projektil- und Gegnerkollisionen: `js/models/World.class.js`
- Spielerbewegung, Energie, Inventar und Schaden: `js/models/Character.class.js`
- Bossenergie, Bosszustände, Bomben und Tod: `js/models/Robot.class.js`
- Bosskampf-Zustandsmodell: `llm-wiki/input/gameplay-state-machine-statt-dauerbedingung.md`
- Aktuelle Architektur-TODOs: `llm-wiki/todo.md`
- HTML- und Asset-Struktur: `index.html`
- Layout und bisherige Desktop-Darstellung: `style.css`

## 12. Einschränkung der Prüfung

Dieses Dokument ist eine statische Bestandsaufnahme mit gezielter Codelektüre. Die lokale semantische Suche und lokale KI-Auswertung sind dafür nicht erforderlich und wurden nicht ausgeführt. Für Kriterien wie Spielbalance, Animationstempo, mobile Darstellung, Lautstärke und tatsächliche Buttonbedienung sind später zusätzliche manuelle Browser- und Gerätetests nötig.
