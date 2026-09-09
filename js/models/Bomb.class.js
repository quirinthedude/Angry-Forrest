class Bomb extends MovableObject {
  width = 150;
  height = 150;
  speedX = 5;

  leftOffset = 0;
  rightOffset = 0;
  topOffset = 0;
  bottomOffset = 0;

  constructor(x, y, flightDirection) {
    super();

    this.loadImage("/img/robot-boss/bomb/bomb_000.png");

    this.x = x;
    this.y = y;
    this.flightDirection = flightDirection;
  }

  update() {
    this.x += this.speedX * this.flightDirection;
  }
}
