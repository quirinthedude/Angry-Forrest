# TODO

## Architektur / Cleanup

### Priorität: später

- [ ] `TITLE_GLYPH_ALIASES` entweder tatsächlich in `ScrollingText` verwenden oder entfernen, falls die Alias-Funktion nicht gebraucht wird.
- [ ] Script-Abhängigkeiten in `index.html` später prüfen und bei passendem Zeitpunkt auf ES-Modules (`type="module"`, `import`/`export`) umstellen. Nicht während der aktuellen Tutorial-Phase erzwingen.
- [ ] `window.game = game` vor der Projektabgabe erneut bewerten. Aktuell als praktischen Debug-Zugang behalten; entfernen, wenn er nicht mehr benötigt wird.

### Death-scene

- enter abfragen und Neustart
- Trauermarsch loop
- Grabstein immer auf festes y setzen
- spiegelung von character ausschalten

### throw fruit

- sound bei werfen der fruit
- animation des characters bei werfen der fruit
- trifft die fruit keinen Gegner bleibt sie am Boden liegen und kann wieder aufgesammelt werden
