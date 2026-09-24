/** Base class for drawable objects that move, animate and collide. */
class MovableObject extends DrawableObject {
  x;
  y;
  img;
  nativeDirection = -1;
  direction = 1;
  imageCache = {};
  currentImage = 0;
  currentAnimation;
  speed = 0.32; // default speed
  animationInterval;
  walkingSound;
  speedY = 0;
  acceleration = 0.8;
  energy = 100;
  lastHit = 0;
  leftOffset;
  rightOffset;
  topOffset = 0;
  bottomOffset = 0;

  /** Cycles through the supplied sprite frames until stopped.
   * @param {string[]} images Image paths whose cached frames are displayed.
   * @param {number} speed Interval between frames in milliseconds.
   * @returns {void}
   */
  animate(images, speed = 100) {
    this.animationInterval = setInterval(() => {
      let i = this.currentImage % images.length;
      let path = images[i];
      this.img = this.imageCache[path];
      this.currentImage++;
    }, speed);
  }

  /** Stops the currently running sprite animation interval. */
  stopAnimation() {
    clearInterval(this.animationInterval);
  }

  /** Plays the supplied sprite frames once and then stops.
   * @param {string[]} images Image paths whose cached frames are displayed.
   * @param {number} speed Interval between frames in milliseconds.
   * @returns {void}
   */
  animateOnce(images, speed = 400) {
    this.stopAnimation();
    this.currentImage = 0;

    this.animationInterval = setInterval(() => {
      let path = images[this.currentImage];
      this.img = this.imageCache[path];
      this.currentImage++;

      if (this.currentImage >= images.length) {
        this.stopAnimation();
      }
    }, speed);
  }

  /** Loads and caches a collection of sprite images.
   * @param {string[]} arr Image paths to load.
   * @returns {void}
   */
  loadImages(arr) {
    arr.forEach((path) => {
      const img = new Image();

      this.trackImage(img, path);

      img.src = path;
      this.imageCache[path] = img;
    });
  }

  /** Moves the object horizontally in its current direction.
   * @param {number} speed Distance to move per call.
   */
  move(speed) {
    this.x += speed * this.direction;
  }

  /** Applies the legacy instant upward movement used by this object. */
  jump() {
    console.log("Jumping");
    this.y -= 10; // Move the character up by 10 pixels
  }

  /** Applies vertical velocity and acceleration to the object. */
  applyGravity() {
    this.y += this.speedY;
    this.speedY += this.acceleration;
  }

  /** Switches to a sprite animation unless it is already active.
   * @param {string[]} images Image paths for the desired animation.
   * @param {number} speed Interval between frames in milliseconds.
   */
  setAnimation(images, speed) {
    if (this.currentAnimation === images) return;

    this.stopAnimation();
    this.animate(images, speed);
    this.currentAnimation = images;
  }

  /** Tests whether this object's adjusted bounds overlap another object.
   * @param {MovableObject} mo Object to test against.
   * @returns {boolean} Whether the adjusted bounds overlap.
   */
  isColliding(mo) {
    const thisOffsets = this.getCollisionOffsets();
    const moOffsets = mo.getCollisionOffsets();

    const thisLeft = this.x + thisOffsets.left;
    const thisRight = this.x + this.width - thisOffsets.right;
    const thisTop = this.y + thisOffsets.top;
    const thisBottom = this.y + this.height - thisOffsets.bottom;

    const moLeft = mo.x + moOffsets.left;
    const moRight = mo.x + mo.width - moOffsets.right;
    const moTop = mo.y + moOffsets.top;
    const moBottom = mo.y + mo.height - moOffsets.bottom;

    return (
      thisRight > moLeft &&
      thisLeft < moRight &&
      thisBottom > moTop &&
      thisTop < moBottom
    );
  }

  /** Finds the first level enemy colliding with this object.
   * @returns {MovableObject|null} Colliding enemy or null.
   */
  checkCollisions() {
    for (const enemy of this.world.level.enemies) {
      if (this.isColliding(enemy)) {
        return enemy;
      }
    }
    return null;
  }

  /** Returns collision offsets in the object's current orientation.
   * @returns {{left: number, right: number, top: number, bottom: number}} Bounds offsets.
   */
  getCollisionOffsets() {
    return {
      left: this.shouldMirror() ? this.leftOffset : this.rightOffset,
      right: this.shouldMirror() ? this.rightOffset : this.leftOffset,
      top: this.topOffset,
      bottom: this.bottomOffset,
    };
  }

  /** Determines whether the object is above its configured ground level.
   * @returns {boolean} Whether the object is airborne.
   */
  isInTheAir() {
    return this.y < this.groundY;
  }

  /** Determines whether the sprite direction differs from its native direction.
   * @returns {boolean} Whether rendering should mirror the sprite.
   */
  shouldMirror() {
    return this.direction !== this.nativeDirection;
  }
}
