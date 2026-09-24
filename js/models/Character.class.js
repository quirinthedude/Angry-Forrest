/** Represents the player character and coordinates movement, combat and inventory. */
class Character extends MovableObject {
  height = 180;
  width = 120;
  leftOffset = 12;
  rightOffset = 36;
  topOffset = 10;
  bottomOffset = 55;

  IMAGES_IDLE = createAnimationImages(
    "./img/character/idle/animation_idle_",
    20,
  );
  IMAGES_WALKING = createAnimationImages(
    "./img/character/walk/animation_walk_",
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
  IMAGES_BOW = createAnimationImages("./img/character/bow/idle_copy_", 12);
  DEAD_IMAGE = "./img/character/dead/6.png";
  currentImage = 0;
  wantsToWalk = false;
  groundY = 305;
  walkSpeed = 1.5;
  airSpeed = 5;
  isDead = false;
  maxFruitInventory = 3;
  fruitInventory = 0;
  inInvulnerable = false;

  activeFruitCollision = new Set();

  /** Creates the player and starts its movement update interval.
   * @param {World} world World containing the player.
   */
  constructor(world) {
    super();
    this.world = world;
    this.loadCharacterImages();
    this.x = 240;
    this.y = 305;
    this.animate(this.IMAGES_IDLE);
    this.moveCharacter();
    this.createCharacterSounds();
    this.currentAnimation = this.IMAGES_IDLE;
    this.collisionDebug = true;
  }

  /** Loads the player's initial sprite and animation frame collections. */
  loadCharacterImages() {
    this.loadImage(this.IMAGES_IDLE[0]);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_BOW);
  }

  /** Creates and configures all sounds used by the player. */
  createCharacterSounds() {
    this.walkingSound = new Audio("/audio/creaking.mp3");
    this.walkingSound.loop = true;
    this.jumpSound = new Audio("/audio/ent_jump.mp3");
    this.hurtSound = new Audio("/audio/ent_hurt.mp3");
    this.deathSound = new Audio("./audio/Mourning Brass - 2.mp3");
    this.fruitSound = new Audio("./audio/fruit_louder.wav");
  }

  /** Runs the player's fixed-rate gameplay update loop. */
  moveCharacter() {
    this.movementInterval = setInterval(() => {
      if (!this.canUpdateCharacter()) return;
      let wantsToWalk = this.world.keyboard.left || this.world.keyboard.right;

      this.handleHorizontalMovement();
      this.handleJump();
      this.throwFruit();
      this.updateVerticalMovement();
      this.updateCamera();
      this.handleCollision();
      this.updateFruitCollection();
      this.world.updateWorldObjects();
      this.collectLandedFruitIfColliding();
      this.updateAnimation(wantsToWalk);
    }, 1000 / 60);
  }

  /** Determines whether the player update loop may process a frame.
   * @returns {boolean} Whether gameplay updates are currently allowed.
   */
  canUpdateCharacter() {
    return this.world.ready && !this.isDead && this.world.game.state === "playing";
  }

  /** Collects newly touched level fruits and records current collisions. */
  updateFruitCollection() {
    const fruits = this.checkFruitCollision();
    for (const fruit of fruits) {
      if (!this.activeFruitCollision.has(fruit)) this.collectFruit(fruit);
    }
    this.activeFruitCollision = new Set(fruits);
  }

  /** Collects a landed thrown fruit when the player is touching it. */
  collectLandedFruitIfColliding() {
    const landedFruit = this.checkLandedFruitCollision();
    if (landedFruit) this.collectLandedFruit(landedFruit);
  }

  /** Applies horizontal input while respecting bounds and air speed. */
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

  /** Starts a jump when the jump control is active. */
  handleJump() {
    if (this.world.keyboard.jump) {
      this.startJump();
    }
  }

  /** Positions the camera relative to the player's horizontal position. */
  updateCamera() {
    this.world.cameraX = -this.x + 240; // Update the camera position based on the character's position
  }

  /** Applies damage when the player contacts an enemy after the hit cooldown. */
  handleCollision() {
    const enemy = this.checkCollisions();
    const now = Date.now();

    if (enemy && now - this.lastHit > 1000) {
      this.takeDamage(10);
    }
  }

  /** Finds level fruits whose adjusted bounds overlap the player.
   * @returns {Fruit[]} Fruits currently colliding with the player.
   */
  checkFruitCollision() {
    const collisions = [];
    const characterOffsets = this.getCollisionOffsets();

    const characterScreenX = this.x + this.world.cameraX;

    const characterLeft = characterScreenX + characterOffsets.left;
    const characterRight =
      characterScreenX + this.width - characterOffsets.right;
    const characterTop = this.y + characterOffsets.top;
    const characterBottom = this.y + this.height - characterOffsets.bottom;

    for (const fruit of this.world.level.fruits) {
      const fruitOffsets = fruit.getCollisionOffsets();
      const fruitScreenX = fruit.x + this.world.cameraX * fruit.parallaxFactor;

      const fruitLeft = fruitScreenX + fruitOffsets.left;
      const fruitRight = fruitScreenX + fruit.width - fruitOffsets.right;
      const fruitTop = fruit.y + fruitOffsets.top;
      const fruitBottom = fruit.y + fruit.height - fruitOffsets.bottom;

      if (
        characterRight > fruitLeft &&
        characterLeft < fruitRight &&
        characterBottom > fruitTop &&
        characterTop < fruitBottom
      ) {
        collisions.push(fruit);
      }
    }

    return collisions;
  }

  /** Stops player activity, switches to the death sprite and notifies the world. */
  characterDies() {
    if (this.isDead) return;

    this.isDead = true;
    this.energy = 0;

    this.stopWalkingSound();
    this.stopAnimation();
    this.loadImage(this.DEAD_IMAGE);

    this.world.characterDied();
  }

  /** Updates the DOM energy-bar image to match current energy. */
  updateCharacterEnergyBar() {
    const index = Math.max(0, Math.ceil(this.energy / 10) - 1);

    document.getElementById("character-energy-bar").src =
      `./img/char_energy/char_energy${index}.png`;
  }

  /** Plays the hurt sound and records the visible hurt feedback. */
  characterHurt() {
    this.hurtSound.currentTime = 0;
    this.hurtSound.play();

    console.log("hurt!", this.energy);
  }

  /** Selects the player animation and walking sound for the current state.
   * @param {boolean} wantsToWalk Whether movement input is active.
   */
  updateAnimation(wantsToWalk) {
    if (this.isDead) return;
    if (this.isHurt()) {
      this.showHurtAnimation();
      return;
    }
    this.showMovementAnimation(wantsToWalk);
  }

  /** Shows the hurt animation and silences walking audio. */
  showHurtAnimation() {
    this.setAnimation(this.IMAGES_HURT, 100);
    this.stopWalkingSound();
  }

  /** Chooses idle, walking or jumping animation from current movement state.
   * @param {boolean} wantsToWalk Whether movement input is active.
   */
  showMovementAnimation(wantsToWalk) {
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

  /** Starts a grounded jump and plays its sound. */
  startJump() {
    if (this.y === this.groundY) {
      this.speedY = -22;
      this.jumpSound.currentTime = 0;
      this.jumpSound.play();
    }
  }

  /** Applies gravity while airborne and clamps the player to the ground. */
  updateVerticalMovement() {
    if (this.y < this.groundY || this.speedY < 0) {
      this.applyGravity();

      if (this.y > this.groundY) {
        this.y = this.groundY;
        this.speedY = 0;
      }
    }
  }

  /** Starts looping walking audio when it is currently paused. */
  startWalkingSound() {
    if (this.walkingSound.paused) {
      this.walkingSound.play();
    }
  }

  /** Stops walking audio and rewinds it to the beginning. */
  stopWalkingSound() {
    this.walkingSound.pause();
    this.walkingSound.currentTime = 0;
  }

  /** Determines whether the recent-hit invulnerability animation is active.
   * @returns {boolean} Whether the hurt interval is still active.
   */
  isHurt() {
    return Date.now() - this.lastHit < 1000;
  }

  /** Removes a level fruit, adds it to inventory and updates UI/audio.
   * @param {Fruit} fruit Fruit collected by the player.
   */
  collectFruit(fruit) {
    if (this.fruitInventory >= this.maxFruitInventory) return;

    const index = this.world.level.fruits.indexOf(fruit);

    if (index === -1) return;

    this.world.level.fruits.splice(index, 1);

    this.fruitInventory++;

    this.fruitSound.currentTime = 0;
    this.fruitSound.play();

    console.log("fruit inventory:", this.fruitInventory);
    this.updateFruitInventory();
  }

  /** Synchronizes inventory slot images with the collected fruit count. */
  updateFruitInventory() {
    const slots = document.querySelectorAll(".fruit-slot");

    slots.forEach((slot, index) => {
      slot.src =
        index < this.fruitInventory
          ? "./img/objects/fruit.png"
          : "./img/objects/fruit_bw.png";
    });
  }

  /** Creates a thrown fruit when requested and inventory is available. */
  throwFruit() {
    if (!this.world.keyboard.throw) return;
    if (this.fruitInventory <= 0) return;
    this.fruitInventory--;
    this.updateFruitInventory();

    const fruit = new ThrownFruit(
      this.x + this.width / 2,
      this.y + 50,
      this.direction,
    );

    this.world.thrownFruits.push(fruit);

    this.world.keyboard.throw = false;
  }

  /** Finds a landed thrown fruit colliding with the player.
   * @returns {ThrownFruit|null} Collectible landed fruit or null.
   */
  checkLandedFruitCollision() {
    for (const fruit of this.world.thrownFruits) {
      if (fruit.state === "landed" && this.isColliding(fruit)) {
        return fruit;
      }
    }
    return null;
  }

  /** Collects a landed thrown fruit and removes it from the world.
   * @param {ThrownFruit} fruit Landed fruit to collect.
   */
  collectLandedFruit(fruit) {
    if (this.fruitInventory >= this.maxFruitInventory) return;

    const index = this.world.thrownFruits.indexOf(fruit);

    if (index === -1) return;

    this.world.thrownFruits.splice(index, 1);

    this.fruitInventory++;
    this.updateFruitInventory();

    this.fruitSound.currentTime = 0;
    this.fruitSound.play();
  }

  /** Reduces energy, triggers hurt feedback and handles death if needed.
   * @param {number} damage Amount of energy to remove.
   */
  takeDamage(damage) {
    if (this.isInvulnerable) return;
    this.energy = Math.max(0, this.energy - damage);
    this.lastHit = Date.now();

    this.characterHurt();
    this.updateCharacterEnergyBar();

    if (this.energy <= 0) {
      this.characterDies();
    }
  }

  /** Stops walking and plays the victory bow animation. */
  bow() {
    this.stopWalkingSound();
    this.animateOnce(this.IMAGES_BOW, 100);
  }

  /** Clears player movement and animation timers. */
  stop() {
    clearInterval(this.movementInterval);
    this.stopAnimation();
    this.stopWalkingSound();
  }
}
