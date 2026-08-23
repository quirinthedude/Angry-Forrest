class Character extends MovableObject {
  height = 180;
  width = 120;
  IMAGES_IDLE = createAnimationImages(
    "./img/character/idle/animation_idle_",
    20,
  );
  IMAGES_WALKING = createAnimationImages(
    "./img/character/walk/animation_walk_",
    20,
  );
  IMAGES_ATTACKING = createAnimationImages(
    "./img/character/attack/animation_attack_",
    20,
  );
  IMAGES_HURT = createAnimationImages(
    "./img/character/hurt/animation_hurt_",
    20,
  );
  IMAGES_JUMPING = createAnimationImages(
    "./img/character/jump/animation_jump_",
    12,
  );
  currentImage = 0;
  wantsToWalk = false;
  isWalking = false;

  constructor(world) {
    super();
    this.world = world;
    this.loadImage(this.IMAGES_IDLE[0]);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_ATTACKING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_JUMPING);
    this.x = 240;
    this.y = 305;
    this.mirrorX = true;

    this.animate(this.IMAGES_IDLE);
    this.moveCharacter();
    this.walkingSound = new Audio("/audio/creaking.mp3");
    this.walkingSound.loop = true;
  }

  moveCharacter() {
    setInterval(() => {
      let wantsToWalk = this.world.keyboard.left || this.world.keyboard.right;
      if (this.world.keyboard.left && this.world.keyboard.right) return;

      if (this.world.keyboard.left && this.x > 230) {
        this.mirrorX = false;
        this.moveLeft(1.5);
        console.log("left");
      }

      if (
        this.world.keyboard.right &&
        this.x < this.world.level.landscape.levelLength - 2200
      ) {
        this.mirrorX = true;
        this.moveRight(1.5);
      }
      this.world.cameraX = -this.x + 240; // Update the camera position based on the character's position
      this.updateAnimation(wantsToWalk);
    }, 1000 / 60);
  }

  /**
   *
   * @param {boolean} wantsToWalk will change when more animations come
   *
   * compares the current intent with the stored animation state.
   */
  updateAnimation(wantsToWalk) {
    if (wantsToWalk === this.isWalking) return;
    this.stopAnimation();
    if (wantsToWalk) {
      this.animate(this.IMAGES_WALKING, 1000 / 20);
      this.walkingSound.play();
    } else {
      this.animate(this.IMAGES_IDLE, 1000 / 60);

      this.walkingSound.pause(); // Pause the walking sound when not walking
      this.walkingSound.currentTime = 0;
    }
    this.isWalking = wantsToWalk;
  }
}
