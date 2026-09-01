class Character extends MovableObject {
  height = 180;
  width = 120;
  leftOffset = 12;
  rightOffset = 36;
  topOffset = 10;
  bottomOffset = 16;

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
  IMAGES_LEAF = createAnimationImages(
    "./img/character/leaf/animation_leaf_",
    18,
  );
  DEAD_IMAGE = "./img/character/dead/6.png";
  currentImage = 0;
  wantsToWalk = false;
  groundY = 305;
  walkSpeed = 1.5;
  airSpeed = 5;
  isDead = false;

  constructor(world) {
    super();
    this.world = world;
    this.loadImage(this.IMAGES_IDLE[0]);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_ATTACKING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_LEAF);
    this.x = 240;
    this.y = 305;

    this.animate(this.IMAGES_IDLE);
    this.moveCharacter();
    this.walkingSound = new Audio("/audio/creaking.mp3");
    this.walkingSound.loop = true;
    this.jumpSound = new Audio("/audio/ent_jump.mp3");
    this.hurtSound = new Audio("/audio/ent_hurt.mp3");
    this.deathSound = new Audio("./audio/Mourning Brass - 2.mp3");
    this.currentAnimation = this.IMAGES_IDLE;
    //remove in time
    this.collisionDebug = true;
    //
  }

  moveCharacter() {
    setInterval(() => {
      if (this.isDead) return;
      let wantsToWalk = this.world.keyboard.left || this.world.keyboard.right;

      this.handleHorizontalMovement();
      this.handleJump();
      this.updateVerticalMovement();
      this.updateCamera();
      this.handleCollision();
      this.updateAnimation(wantsToWalk);
    }, 1000 / 60);
  }

  handleHorizontalMovement() {
    let movementSpeed = this.isInTheAir() ? this.airSpeed : this.walkSpeed;

    if (this.world.keyboard.left && this.world.keyboard.right) return;

    if (this.world.keyboard.left && this.x > 230) {
      this.direction = -1;
      this.move(movementSpeed);
    }

    if (
      this.world.keyboard.right &&
      this.x < this.world.level.landscape.levelLength - 2200
    ) {
      this.direction = 1;
      this.move(movementSpeed);
    }
  }

  handleJump() {
    if (this.world.keyboard.jump) {
      this.startJump();
    }
  }

  updateCamera() {
    this.world.cameraX = -this.x + 240; // Update the camera position based on the character's position
  }

  handleCollision() {
    const enemy = this.checkCollisions();
    const now = Date.now();

    if (enemy && now - this.lastHit > 1000) {
      this.energy -= 10;
      this.lastHit = now;

      this.characterHurt();
      this.updateCharacterEnergyBar();

      if (this.energy <= 0) {
        this.characterDies();
      }
    }
  }

  characterDies() {
    if (this.isDead) return;

    this.isDead = true;
    this.energy = 0;

    this.stopWalkingSound();
    this.stopAnimation();
    this.loadImage(this.DEAD_IMAGE);

    this.world.characterDied();
  }

  updateCharacterEnergyBar() {
    const index = Math.max(0, Math.ceil(this.energy / 10) - 1);

    document.getElementById("character-energy-bar").src =
      `./img/char_energy/char_energy${index}.png`;
  }

  characterHurt() {
    this.hurtSound.currentTime = 0;
    this.hurtSound.play();

    console.log("hurt!", this.energy);
    // play animation character hurt
    // play sound hurt
    // timeout of 1 s, blinking therewhile
  }

  /**
   *
   * @param {boolean} wantsToWalk will change when more animations come
   *
   * compares the current intent with the stored animation state.
   */
  updateAnimation(wantsToWalk) {
    if (this.isDead) return;
    if (this.isHurt()) {
      this.setAnimation(this.IMAGES_HURT, 100);
      this.stopWalkingSound();
      return;
    }
    if (this.y < this.groundY) {
      this.setAnimation(this.IMAGES_JUMPING, 100);
    } else if (wantsToWalk) {
      this.setAnimation(this.IMAGES_WALKING, 50);
      this.startWalkingSound();
      return;
    } else {
      this.setAnimation(this.IMAGES_IDLE, 100);
    }

    this.stopWalkingSound();
  }

  startJump() {
    if (this.y === this.groundY) {
      this.speedY = -22;
      this.jumpSound.currentTime = 0;
      this.jumpSound.play();
    }
  }

  updateVerticalMovement() {
    if (this.y < this.groundY || this.speedY < 0) {
      this.applyGravity();

      if (this.y > this.groundY) {
        this.y = this.groundY;
        this.speedY = 0;
      }
    }
  }

  startWalkingSound() {
    if (this.walkingSound.paused) {
      this.walkingSound.play();
    }
  }

  stopWalkingSound() {
    this.walkingSound.pause();
    this.walkingSound.currentTime = 0;
  }

  isHurt() {
    return Date.now() - this.lastHit < 1000;
  }
}
