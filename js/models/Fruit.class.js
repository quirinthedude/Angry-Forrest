/** Represents a collectible fruit suspended in the level. */
class Fruit extends MovableObject {
  /** Creates a collectible at the supplied world position.
   * @param {number} x Horizontal world position.
   * @param {number} y Vertical world position.
   */
  width = 50;
  height = 48;

  leftOffset = 10;
  rightOffset = 10;
  topOffset = 0;
  bottomOffset = 10;

  parallaxFactor = 1.8;

  collisionDebug = true;

  constructor(x, y) {
    super();
    this.loadImage("./img/objects/fruit.png");
    this.x = x;
    this.y = y;
  }
}
