/** Represents a fruit in flight or resting after being thrown. */
class ThrownFruit extends MovableObject {
  width = 50;
  height = 48;

  leftOffset = 10;
  rightOffset = 10;
  topOffset = 0;
  bottomOffset = 10;

  speedX = 4;
  speedY = -12;
  acceleration = 0.48;

  state = "flying";
  groundY = 420;

  IMAGES_HIT = [
    "./img/objects/hit1.png",
    "./img/objects/hit2.png",
    "./img/objects/hit3.png",
  ];

  /** Creates a thrown fruit with an initial trajectory.
   * @param {number} x Horizontal start position.
   * @param {number} y Vertical start position.
   * @param {number} direction Horizontal direction multiplier.
   */
  constructor(x, y, direction) {
    super();
    this.loadImage("/img/objects/fruit.png");
    this.loadImages(this.IMAGES_HIT);

    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  /** Advances fruit movement within the reachable play area */
  update(bounds) {
    if (!["flying", "deflected", "falling"].includes(this.state)) return;

    this.x += this.speedX * this.direction;
    this.stopAtBoundary(bounds);

    this.y += this.speedY;
    this.speedY += this.acceleration;

    if (this.y >= this.groundY) {
      this.land();
    }
  }

  /** Stops movement and marks the fruit as collectible on the ground. */
  land() {
    this.state = "landed";
    this.y = this.groundY;
    this.speedX = 0;
    this.speedY = 0;
  }

  /** Marks the fruit as having hit an enemy and stops its flight. */
  hit() {
    if (this.state !== "flying") return;

    this.state = "hit";
    this.animateOnce(this.IMAGES_HIT, 80);
  }

  /**
   * Deflects the fruit after hitting a MiniRobot.
   * Reverses horizontal direction and applies a small upward impulse.
   */
  deflect() {
    if (this.state !== "flying") return;

    this.state = "deflected";
    this.direction *= -1;
    this.speedX = 2;
    this.speedY = -5;
  }

  /** Stops horizintal flight at the reachable play-area boundaries */
  stopAtBoundary({ minX, maxX }) {
    if (this.x > minX && this.x < maxX) return;

    this.x = Math.max(minX, Math.min(maxX, this.x));
    this.state = "falling";
    this.speedX = 0;
    this.speedY = Math.max(0, this.speedY);
  }
}
