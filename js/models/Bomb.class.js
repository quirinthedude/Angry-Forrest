class Bomb extends MovableObject {
  width = 150;
  height = 150;
  speedX = 5;
  speedY = -8;
  acceleration = 0.35;
  frameTime = 100;

  leftOffset = 30;
  rightOffset = 30;
  topOffset = 30;
  bottomOffset = 30;

  IMAGES_FLYING = createAnimationImages("/img/robot-boss/bomb/bomb_", 10);

  constructor(x, y, flightDirection) {
    super();

    this.loadImage(this.IMAGES_FLYING[0]);
    this.loadImages(this.IMAGES_FLYING);

    this.x = x;
    this.y = y;
    this.flightDirection = flightDirection;

    this.animateOnce(this.IMAGES_FLYING, this.frameTime);

    this.createdAt = Date.now();

    this.explodingSound = new Audio("./audio/bomb.mp3");
    this.explodingSound.currentTime = 0;
    this.explodingSound.play();
  }

  update() {
    this.x += this.speedX * this.flightDirection;
    this.y += this.speedY;
    this.speedY += this.acceleration;
  }

  isFinished() {
    const lifeTime =
      this.IMAGES_FLYING.length * this.frameTime + this.frameTime;

    return Date.now() - this.createdAt >= lifeTime;
  }
}
