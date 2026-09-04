class ThrownFruit extends MovableObject {
  width = 50;
  height = 48;

  speedX = 5;
  speedY = -12;
  acceleration = 0.48;

  constructor(x, y, direction) {
    super();
    this.loadImage("/img/objects/fruit.png");
    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  update() {
    this.x += this.speedX * this.direction;
    this.y += this.speedY;
    this.speedY += this.acceleration;
  }
}
