/**
 * Coordinates the character's sleep animation after prolonged inactivity.
 */
class Sleep {
  delay = 15000;
  holdDuraction = 3000;
  animationSpeed = 100;

  lastActivityAt = null;
  isAnimating = false;
  timeout = null;

  /**
   * Creates the sleep controller for the supplied character.
   *
   * @param {Character} character Character whose bow frames are used for sleep.
   */
  constructor(character) {
    this.character = character;
    this.reverseImages = [...character.IMAGES_BOW].reverse();
  }

  /**
   * Advances the inactivity state and starts sleeping when the delay expires.
   *
   * @returns {boolean} Whether the sleep animation currently owns the character animation.
   */
  update() {
    if (this.lastActivityAt === null) {
      this.resetTimer();
      return false;
    }

    if (this.isAnimating) return true;
    if (!this.hasReachedSleepDelay()) return false;

    this.start();
    return true;
  }

  /**
   * Resets inactivity and interrupts an active sleep animation.
   */
  reset() {
    this.resetTimer();

    if (this.isAnimating) {
      this.stop();
    }
  }

  /**
   * Starts the forward bow animation.
   */
  start() {
    this.isAnimating = true;
    this.character.animateOnce(this.character.IMAGES_BOW, this.animationSpeed);

    this.timeout = setTimeout(
      () => this.playReverse(),
      this.getAnimationDuration() + this.holdDuration,
    );
  }

  /**
   * Plays the bow frames backwards to return to the standing pose.
   */
  playReverse() {
    this.character.animateOnce(this.reverseImages, this.animationSpeed);

    this.timeout = setTimeout(() => this.finish(), this.getAnimationDuration());
  }

  /**
   * Completes one sleep cycle and starts a new inactivity period.
   */
  finish() {
    this.timeout = null;
    this.isAnimating = false;
    this.resetTimer();
    this.releaseAnimation();
  }

  /**
   * Interrupts the current sleep sequence.
   */
  stop() {
    clearTimeout(this.timeout);
    this.timeout = null;

    this.character.stopAnimation();
    this.isAnimating = false;
    this.releaseAnimation();
  }

  /**
   * Records the beginning of a new inactivity period.
   */
  resetTimer() {
    this.lastActivityAt = Date.now();
  }

  /**
   * Checks whether the inactivity delay has elapsed.
   *
   * @returns {boolean} Whether sleeping may begin.
   */
  hasReachedSleepDelay() {
    return Date.now() - this.lastActivityAt >= this.delay;
  }

  /**
   * Returns the duration of one forward or reverse bow animation.
   *
   * @returns {number} Animation duration in milliseconds.
   */
  getAnimationDuration() {
    return this.character.IMAGES_BOW.length * this.animationSpeed;
  }

  /**
   * Allows Character to select its normal animation again.
   */
  releaseAnimation() {
    this.character.currentAnimation = undefined;
  }
}
