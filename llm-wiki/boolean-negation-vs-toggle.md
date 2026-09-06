# Boolean negation: `x = !y` vs. Toggle

## `x = !y`

```js
energyBar.hidden = !visible;
```

`!` negiert einen Boolean:

```text
visible = true  -> hidden = false
visible = false -> hidden = true
```

Die linke Variable wird also **gezielt auf das Gegenteil** der rechten gesetzt.

Das ist besonders passend für Methoden wie:

```js
setGameplayUiVisible(visible)
```

Denn `set...` soll einen eindeutigen Zustand herstellen und nicht vom bisherigen Zustand abhängen.

## Toggle

Ein Toggle dreht dagegen den **aktuellen Zustand** um:

```js
energyBar.hidden = !energyBar.hidden;
```

oder beispielsweise:

```js
energyBar.classList.toggle("hidden");
```

Das bedeutet:

```text
sichtbar   -> unsichtbar
unsichtbar -> sichtbar
```

## Merksatz

```text
x = !y   -> Zustand gezielt aus einem anderen Boolean ableiten
toggle   -> bestehenden Zustand umdrehen
```

Bildlich:

```text
toggle()          = Lichtschalter drücken
hidden = !visible = Licht gezielt an oder aus setzen
```
