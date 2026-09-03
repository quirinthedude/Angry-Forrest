class Fruit extends MovableObject {
  width = 50;
  height = 48;
  parallaxFactor = 0.8;

  constructor(x, y) {
    super();
    this.loadImage("./img/objects/fruit.png");
    this.x = x;
    this.y = y;
  }
}
