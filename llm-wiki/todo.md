# TODO

## Architektur / Cleanup

- [ ] `World` verwaltet die Updates von `thrownFruits`, `bombs`, Projectile-Collisions und Enemies inzwischen selbst über `updateWorldObjects()`. Der 60-FPS-Takt dafür wird aber weiterhin aus `Character.moveCharacter()` ausgelöst. Später prüfen, ob `World` bzw. ein zentraler Game-Loop diesen Taktgeber übernehmen soll.

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

### animateOnce()

- stoppt ein laufendes Interval, aktualisiert aber currentAnimation nicht. Dadurch kann setAnimation() später fälschlich denken, eine Animation laufe noch. Das ist ein echter kleiner Architekturfehler in MovableObject
