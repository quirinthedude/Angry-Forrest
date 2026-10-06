/** Represents a patrolling, jumping mini-robot enemy. */
class MiniRobot extends MovableObject {
  height = 120;
  width = 120;
  leftOffset = 40;
  rightOffset = 40;
  topOffset = 35;
  bottomOffset = 0;
  nativeDirection = 1;
  isKnockedOut = false;

  groundY = 360;
  speed = 1.5; // schneller als Gnome
  jumpInterval = 2000;
  lastJumpTime = 0;

  IMAGES_JUMPING = createAnimationImages(
    "/img/mini_robot/Falling Down/mini-robot_",
    6,
  );
  IMAGES_RUNNING = createAnimationImages(
    "/img/mini_robot/Run Slashing/mini-robot_",
    12,
  );
  IMAGES_HURT = createAnimationImages("/img/mini_robot/Hurt/mini-robot_", 12);

  /** Creates a mini-robot with patrol bounds.
   * @param {number} x Initial horizontal position.
   * @param {number} y Initial vertical position.
   * @param {number} minX Left patrol boundary.
   * @param {number} maxX Right patrol boundary.
   * @param {World} world Owning game world.
   */
  constructor(x, y, minX, maxX, world) {
    super();
    this.world = world;
    this.loadImage(this.IMAGES_RUNNING[0]);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_RUNNING);
    this.loadImages(this.IMAGES_HURT);

    this.jumpingSound = new Audio("./audio/mini_robot_jump.mp3");
    this.deathSound = new Audio("./audio/mini_robot_hurt.mp3");

    this.x = x;
    this.y = y;
    this.minX = minX;
    this.maxX = maxX;
    this.lastJumpTime = Date.now();

    this.setAnimation(this.IMAGES_RUNNING, 50);
    this.moveMiniRobot();
  }

  /** Starts the mini-robot patrol interval. */
  moveMiniRobot() {
    this.movementInterval = setInterval(() => {
      if (!this.world.ready || this.isKnockedOut) return;

      if (this.x < this.minX) {
        this.direction = 1;
      } else if (this.x > this.maxX) {
        this.direction = -1;
      }

      this.move(this.speed);
    }, 20);
  }

  /** Evaluates jump timing and advances vertical movement. */
  update() {
    if (!this.world.ready) return;

    if (this.isKnockedOut) {
      this.updateKnockout();
      return;
    }

    const now = Date.now();
    if (
      !this.isInTheAir() &&
      this.speedY === 0 &&
      now - this.lastJumpTime >= this.jumpInterval
    ) {
      this.startJump();
    }

    this.updateVerticalMovement();
  }

  /** Starts a visible jump when the mini-robot is on screen. */
  startJump() {
    if (!this.isVisibleInCanvas()) return;
    this.speedY = -16;
    this.lastJumpTime = Date.now();

    this.jumpingSound.currentTime = 0;
    this.jumpingSound.play();

    this.setAnimation(this.IMAGES_JUMPING, 100);
  }

  /** Applies gravity and returns the robot to its ground level. */
  updateVerticalMovement() {
    if (this.isInTheAir() || this.speedY < 0) {
      this.applyGravity();

      if (this.y >= this.groundY) {
        this.y = this.groundY;
        this.speedY = 0;
        this.setAnimation(this.IMAGES_RUNNING, 50);
      }
    }
  }

  /** Determines whether the robot overlaps the visible canvas area.
   * @returns {boolean} Whether any part of the robot is visible.
   */
  isVisibleInCanvas() {
    const screenX = this.x + this.world.cameraX;

    return screenX + this.width > 0 && screenX < this.world.canvas.width;
  }

  /** Stops patrol and sprite animation timers. */
  stop() {
    clearInterval(this.movementInterval);
    this.stopAnimation();
  }

  /**
   * Handles contact with the character and applies a successful stomp.
   *
   * @param {Character} character Colliding player character.
   */
  handleCharacterCollision(character) {
    if (this.isKnockedOut) return true;

    if (!this.isStompedBy(character)) return false;
    this.knockOut();
    character.speedY = -12;
    return true;
  }

  /**
   * Determines whether a descending character crossed the robot's top edge.
   *
   * @param {Character} character Colliding player character.
   * @returns {boolean} Whether the collision is a stomp from above.
   */
  isStompedBy(character) {
    if (character.speedY <= 0) return false;

    const characterOffsets = character.getCollisionOffsets();
    const robotOffsets = this.getCollisionOffsets();

    const characterBottom =
      character.y + character.height - characterOffsets.bottom;

    const robotTop = this.y + robotOffsets.top;

    const previousCharacterBottom =
      characterBottom - (character.speedY - character.acceleration);
    return previousCharacterBottom <= robotTop;
  }

  /** Starts the hurt animation and downward knockout movement. */
  knockOut() {
    if (this.isKnockedOut) return;

    this.isKnockedOut = true;

    this.stopAnimation();
    this.animateOnce(this.IMAGES_HURT, 50);

    this.deathSound.currentTime = 0;
    this.deathSound.play();
    this.speedY = 4;
    this.acceleration = 0.6;
  }

  /** Advances knockout movement and removes the robot below the canvas. */
  updateKnockout() {
    this.y += this.speedY;
    this.speedY += this.acceleration;

    if (this.y >= this.world.canvas.height) {
      this.removeFromLevel();
    }
  }

  /** Removes this robot from the active level enemy collection. */
  removeFromLevel() {
    const index = this.world.level.enemies.indexOf(this);

    if (index !== -1) {
      this.world.level.enemies.splice(index, 1);
    }
  }
}
