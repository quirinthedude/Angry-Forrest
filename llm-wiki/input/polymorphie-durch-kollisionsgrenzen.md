# Polymorphie durch objektbezogene Kollisionsgrenzen

## Allgemeines Prinzip

**Polymorphie** bedeutet in der objektorientierten Programmierung, dass derselbe Methodenaufruf bei verschiedenen Objekttypen ein typspezifisches Verhalten auslösen kann. Eine Basisklasse definiert eine gemeinsame Schnittstelle; Unterklassen können deren Implementierung überschreiben.

Ein wichtiger Architekturvorteil: Eine Methode, die mit anderen Objekten arbeitet, muss deren konkrete Klasse nicht kennen. Sie fordert nur die benötigte Information über die gemeinsame Schnittstelle an.

**Achtung:** Ein Aufruf wie `other.getCollisionBounds()` ist zunächst *polymorphiefähig*. Solange keine Unterklasse die Methode überschreibt, läuft für alle Objekte dieselbe geerbte Implementierung. Die Erweiterbarkeit ist bereits vorhanden, unterschiedliche Implementierungen sind aber nicht zwingend vorhanden.

## Beispiel aus Angry Forrest

Vor dem Refactor berechnete `isColliding(mo)` die Kollisionsgrenzen von `this` und `mo` direkt, indem sie für beide Objekte `getCollisionOffsets()` aufrief und aus Position, Grösse und Offsets Grenzen zusammensetzte.

Nach dem Refactor fragt sie jedes beteiligte Objekt nach dessen eigenen Grenzen:

```js
isColliding(mo) {
  const thisBounds = this.getCollisionBounds();
  const moBounds = mo.getCollisionBounds();

  return (
    thisBounds.right > moBounds.left &&
    thisBounds.left < moBounds.right &&
    thisBounds.bottom > moBounds.top &&
    thisBounds.top < moBounds.bottom
  );
}

getCollisionBounds() {
  const offsets = this.getCollisionOffsets();

  return {
    left: this.x + offsets.left,
    right: this.x + this.width - offsets.right,
    top: this.y + offsets.top,
    bottom: this.y + this.height - offsets.bottom,
  };
}
```

Die Kollisionsbedingungen bleiben unverändert (`>`, `<`, `>`, `<`). Auch die orientierungsabhängigen Offsets werden weiterhin über `getCollisionOffsets()` berücksichtigt.

## Warum ist das besser?

- **Kapselung:** Jedes Objekt liefert selbst seine Kollisionsgrenzen.
- **Geringere Kopplung:** `isColliding()` kennt keine Details darüber, wie das Gegenüber diese Grenzen berechnet.
- **Erweiterbarkeit:** Eine Unterklasse könnte später `getCollisionBounds()` überschreiben, ohne `isColliding()` ändern zu müssen.
- **Lesbarkeit:** Die eigentliche Überlappungsprüfung ist von der Geometrieberechnung getrennt.

### Hypothetische Erweiterung – nicht Teil des Refactors

```js
class SpecialEnemy extends MovableObject {
  getCollisionBounds() {
    const bounds = super.getCollisionBounds();
    return { ...bounds, top: bounds.top + 10 };
  }
}
```

`isColliding()` würde für `SpecialEnemy` automatisch die angepassten Grenzen verwenden. Das Beispiel illustriert Polymorphie; es soll **nicht** ohne Gameplay-Abklärung in Angry Forrest eingebaut werden.

## Erkenntnis und Grenze

Das Refactoring in `js/models/MovableObject.class.js` (Etappe 14/16) führte `getCollisionBounds()` ein und delegierte die Grenzberechnung an die beiden Kollisionspartner. Syntaxprüfung und manueller Spieldurchlauf ergaben keine beobachteten Änderungen bei Kollisionen oder Sprüngen.

**Merksatz:** *Frage ein Objekt nach seiner eigenen Information, statt die Information über das Objekt an anderer Stelle nachzubauen.*

Eine Einschränkung bleibt: Überschreibt eine Unterklasse die neue Methode später, kann sich das Kollisionsverhalten absichtlich oder unbeabsichtigt verändern. Solche Änderungen benötigen eigene Tests.
