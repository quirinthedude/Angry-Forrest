# Git – Branches, Merge und die gemeinsame Entwicklung

## Grundidee: Warum überhaupt Branches?

Ein **Branch** ist ein benannter Zeiger auf einen Commit in der Git-Historie. Er ist keine vollständige Kopie des Projektordners. Auf einem Branch lässt sich eine Änderung unabhängig vom stabilen Entwicklungsstand vorbereiten.

Typisches Vorgehen:

```text
main (stabil)
  |
  +---- fix/kollision (Fehler beheben, Tests hinzufügen)
  |             |
  |             +---- fertig und geprüft
  |                     |
  +---------------------+---- main (mit Korrektur)
```

Damit kann man experimentieren, ohne unfertige Änderungen sofort in `main` zu übernehmen. Branches sind besonders nützlich für Fehlerkorrekturen, neue Features, Refactorings und die Zusammenarbeit mehrerer Entwickler.

**Merksatz:** Ein Branch trennt die *Entwicklung* einer Änderung von ihrer *Integration* in den gemeinsamen Stand.

## Begriffe, die man unterscheiden muss

| Begriff | Bedeutung |
| --- | --- |
| `main` | Lokaler Hauptbranch. |
| `fix/grouped-mini-robot-stomps` | Lokaler Branch für eine gezielte Fehlerkorrektur. |
| `origin` | Kurzname des entfernten Git-Repositories (hier GitHub). |
| `origin/main` | Lokal gespeicherter Kenntnisstand des Hauptbranches auf `origin`. |
| `HEAD` | Verweis auf den aktuell ausgecheckten Commit beziehungsweise Branch. |
| `commit` | Gespeicherter Stand mit eigener Kennung und Historie. |
| `merge` | Führt Entwicklungsverläufe zusammen. |
| `push` | Überträgt lokale Commits an das entfernte Repository. |

**Wichtig:** `git merge` arbeitet zunächst **lokal**. Erst `git push` veröffentlicht die zusammengeführten Commits auf GitHub.

## Praxisbeispiel: Zwei MiniRobots in Angry Forrest

**Ausgangslage:** Entie sprang von oben auf zwei überlappende MiniRobots. Obwohl beide besiegt wurden, nahm Entie manchmal Schaden.

Die Korrektur entstand auf dem Feature-Branch `fix/grouped-mini-robot-stomps`. Dort wurden unter anderem die gleichzeitige Kollisionserkennung und die gruppierte Stomp-Verarbeitung angepasst. Zehn automatisierte Regressionstests sowie ein praktischer Spieltest prüften das Verhalten.

Vor dem Merge zeigte Git:

```text
main                            396ac5f
fix/grouped-mini-robot-stomps   1960493
```

Zuerst wechselten wir auf den **empfangenden Branch**, also `main`:

```bash
git status -sb                         # Arbeitsverzeichnis prüfen
git switch main                        # In diesen Branch soll gemergt werden
git fetch origin                       # Informationen über GitHub aktualisieren
git pull --ff-only origin main         # Main nur konfliktfrei vorwärts aktualisieren
```

Dann führten wir den Merge aus:

```bash
git merge --no-ff fix/grouped-mini-robot-stomps \
  -m "Merge grouped minirobots stomp fix"
```

Git meldete `Merge made by the 'ort' strategy.` und erzeugte den Merge-Commit `a4f0cde`.

## Was zeigt der Git-Graph?

```bash
git log --oneline --graph --decorate -8
```

Die tatsächliche Ausgabe enthielt diesen Ausschnitt:

```text
*   a4f0cde (HEAD -> main) Merge grouped minirobots stomp fix
|\
| * 1960493 test: cover multi-robot stomps and existing combat rules
| * edc7fbb fix: resolve overlapping mini-robot stomps as a group
| * e98038f fix: gather every simultaneous enemy contact
|/
* 396ac5f (origin/main) VictoryScene changing speed of scrolling text by button
```

Die Abzweigung zeigt drei Commits der Fehlerkorrektur. `a4f0cde` verbindet die beiden Entwicklungsverläufe. `HEAD -> main` kennzeichnet den aktuellen lokalen Stand.

Direkt danach stand bei `git status -sb`:

```text
## main...origin/main [ahead 4]
```

**Warum vier?** Drei Feature-Commits **plus ein Merge-Commit** waren lokal vorhanden, aber noch nicht auf GitHub veröffentlicht. `[ahead 4]` bedeutet **nicht**, dass vier Dateien verändert oder ungespeichert wären.

## Was bewirkt `--no-ff`?

Ein *Fast-Forward*-Merge ist möglich, wenn `main` seit dem Abzweigen nicht selbst weiterentwickelt wurde. Git könnte dann den Zeiger `main` einfach auf den letzten Feature-Commit setzen:

```text
Vorher:  A (main) --- B --- C (feature)
Nachher: A ---------- B --- C (main, feature)
```

Mit `--no-ff` (**no fast-forward**) erzwingen wir stattdessen einen eigenen Merge-Commit. So bleibt der zusammengehörige Feature-Zweig im Git-Graphen erkennbar.

Beide Varianten sind gültig. `--no-ff` war hier eine bewusste Entscheidung zur Nachvollziehbarkeit – **keine allgemeine Git-Pflicht**.

## Nach dem Merge: Prüfen und veröffentlichen

```bash
node --test tests/multi-robot-stomp.test.cjs  # Regressionstests erneut starten
git status -sb                                 # Lokalen Zustand kontrollieren
git push origin main                           # Merge auf GitHub veröffentlichen
git status -sb                                 # Synchronisation kontrollieren
```

Wenn `main` und `origin/main` danach übereinstimmen, steht dort typischerweise:

```text
## main...origin/main
```

**Hinweis:** Der praktische Spieltest und die zehn Tests waren bereits erfolgreich. Der oben dokumentierte Push ist ein **nachgelagerter Schritt**; aus dem gezeigten lokalen Merge allein folgt noch nicht, dass GitHub aktualisiert wurde.

## Und was ist ein Pull Request?

Ein **Pull Request (PR)** ist eine GitHub-Funktion für Diskussion, Review und Freigabe einer geplanten Änderung. Er ist **nicht** dasselbe wie `git pull` und kein eigener Git-Merge-Befehl.

Für diese Korrektur gab es einen Draft-PR (`#2`). Wir haben den Merge bewusst lokal im Terminal gelernt. Bei Teamarbeit wird häufig stattdessen der PR geprüft und über GitHub gemergt. Ein lokaler Merge auf `main` mit anschliessendem Push ersetzt nicht automatisch den organisatorischen Review-Prozess.

## Wenn beim Merge ein Konflikt entsteht

Ein **Merge-Konflikt** kann entstehen, wenn beide Branches dieselbe Stelle unterschiedlich geändert haben und Git nicht eindeutig entscheiden kann. Dann wird der Merge unterbrochen; man muss den Inhalt bewusst auflösen.

```bash
git status                 # Konfliktdateien anzeigen
# Konflikte in den Dateien bearbeiten
git add pfad/zur/datei     # Gelöste Datei markieren
git merge --continue       # Angefangenen Merge abschliessen
```

Falls man den noch nicht abgeschlossenen Merge verwerfen möchte:

```bash
git merge --abort
```

**Vorsicht:** Nicht blind Konfliktmarker löschen oder einfach eine Seite übernehmen. Erst klären, welche Funktionalität aus *beiden* Änderungen erhalten bleiben soll.

## Branch nach einem erfolgreichen Merge aufräumen

Erst **nach** dem erfolgreichen Push und einer abschliessenden Prüfung kann der lokale Feature-Branch entfernt werden:

```bash
git branch --merged main                      # Bereits integrierte Branches anzeigen
git branch -d fix/grouped-mini-robot-stomps    # Lokalen Branch sicher löschen
```

Den Remote-Branch muss man nicht sofort löschen. Falls erwünscht, geschieht das separat, beispielsweise nach Klärung des zugehörigen PRs.

## Merksätze

- **Branch:** isoliert eine Änderung und markiert einen Entwicklungsverlauf.
- **Commit:** speichert einen nachvollziehbaren Zwischenstand.
- **Merge:** integriert die Geschichte eines Branches in den aktuell ausgecheckten Branch.
- **`--no-ff`:** behält einen eigenen Merge-Commit für die Integration.
- **`fetch`:** aktualisiert Wissen über Remote-Commits; **`pull`:** integriert sie zusätzlich.
- **`push`:** veröffentlicht lokale Commits – auch einen lokalen Merge.
- **`--oneline`:** eine Zeile pro Commit; nicht `--online`.

**Kurzform des Arbeitsablaufs:** Branch entwickeln → testen → `main` aktualisieren → in `main` mergen → erneut testen → pushen → optional aufräumen.
