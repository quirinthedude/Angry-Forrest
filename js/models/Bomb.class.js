/** Represents a bomb thrown by the boss and its timed flight. */
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

  /** Creates and starts a bomb at the supplied position.
   * @param {number} x Horizontal start position.
   * @param {number} y Vertical start position.
   * @param {number} flightDirection Horizontal direction multiplier.
   */
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
    this.explodingSound.muted = isMuted;
    this.explodingSound.currentTime = 0;
    this.explodingSound.play();
  }

  /** Advances the bomb according to its velocity and gravity. */
  update() {
    this.x += this.speedX * this.flightDirection;
    this.y += this.speedY;
    this.speedY += this.acceleration;
  }

  /** Determines whether the bomb's configured lifetime has elapsed.
   * @returns {boolean} Whether the bomb should be removed from the world.
   */
  isFinished() {
    const lifeTime =
      this.IMAGES_FLYING.length * this.frameTime + this.frameTime;

    return Date.now() - this.createdAt >= lifeTime;
  }
}
