/** Represents a bomb thrown by the boss and its timed flight. */
class Bomb extends MovableObject {
  width = 150;
  height = 150;

  speedX = 8;
  speedY = -8;
  acceleration = 0.35;

  fuseTime = 750;
  damageDuration = 500;
  damage = 34;

  hasDamagedCharacter = false;

  frameTime = 100;

  leftOffset = 30;
  rightOffset = 30;
  topOffset = 30;
  bottomOffset = 30;

  IMAGES_FLYING = createAnimationImages("/img/robot-boss/bomb/bomb_", 10);

  /**
   * Creates and starts a bomb at the supplied position.
   *
   * @param {number} x Horizontal start position.
   * @param {number} y Vertical start position.
   * @param {number} flightDirection Horizontal direction multiplier.
   * @param {AudioManager} audioManager Audio manager owning the bomb sound.
   */
  constructor(x, y, flightDirection, audioManager) {
    super();

    this.loadImage(this.IMAGES_FLYING[0]);
    this.loadImages(this.IMAGES_FLYING);

    this.x = x;
    this.y = y;
    this.flightDirection = flightDirection;

    this.animateOnce(this.IMAGES_FLYING, this.frameTime);

    this.createdAt = Date.now();

    this.explodingSound = audioManager.createTransientAudio("./audio/bomb.mp3");
    this.explodingSound.currentTime = 0;
    this.explodingSound
      .play()
      .catch(() => audioManager.unregister(this.explodingSound));
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
    return Date.now() - this.createdAt >= this.fuseTime + this.damageDuration;
  }

  /**
   * Determines whether the bomb is within its collision-damage window.
   *
   * @returns {boolean} Whether the bomb is currently exploding.
   */
  isExploding() {
    const age = Date.now() - this.createdAt;

    return age >= this.fuseTime && age < this.fuseTime + this.damageDuration;
  }

  /** Stops the bomb animation without interrupting its transient sound. */
  stop() {
    this.stopAnimation();
  }
}
