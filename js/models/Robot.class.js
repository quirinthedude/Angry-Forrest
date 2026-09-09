class Robot extends MovableObject {
  height = 260;
  width = 228;
  topOffset = 100;
  bottomOffset = 0;
  leftOffset = 20;
  rightOffset = 65;
  isDead = false;
  lastBombThrow = 0;
  bombCooldown = 2000;
  isFighting = false;
  fightState = "inactive";
  chargeTargetX = null;
  // isTurning = false;

  IMAGES_IDLE = createAnimationImages("./img/robot-boss/Idle/idle_", 9);
  IMAGES_WALKING = createAnimationImages("./img/robot-boss/Walk/Walk_", 12);
  IMAGES_RUNNING = createAnimationImages("./img/robot-boss/Run/Run_", 12);
  IMAGES_RUN_ATTACKING = createAnimationImages(
    "./img/robot-boss/Run_Attack/Run_Attack_",
    12,
  );
  IMAGES_ATTACKING = createAnimationImages(
    "./img/robot-boss/Attack/Attack_",
    18,
  );
  IMAGES_JUMPING = createAnimationImages("./img/robot-boss/Jump/Jump_", 13);
  IMAGES_SITTING = createAnimationImages("./img/robot-boss/Sit/Sit_", 15);
  IMAGES_TURNING_TO_RUN = createAnimationImages(
    "./img/robot-boss/Turn_to_Run/Turn_to_run_",
    4,
  );
  IMAGES_TURNING_TO_WALK = createAnimationImages(
    "./img/robot-boss/Turn_to_walk/Turn_to_walk_",
    4,
  );
  IMAGES_DYING = createAnimationImages("./img/robot-boss/Death/Death_", 15);
  isActivated = false;
  activationInterval;
  groundY = 212;

  constructor(x, y, world) {
    super();
    this.world = world;
    this.loadImage(this.IMAGES_IDLE[0]);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_RUNNING);
    this.loadImages(this.IMAGES_RUN_ATTACKING);
    this.loadImages(this.IMAGES_ATTACKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_SITTING);
    this.loadImages(this.IMAGES_TURNING_TO_RUN);
    this.loadImages(this.IMAGES_TURNING_TO_WALK);
    this.loadImages(this.IMAGES_DYING);
    this.animate(this.IMAGES_IDLE, 100);
    this.x = x;
    this.y = y;
    this.acceleration = 0.5;
    this.damageSound = new Audio("/audio/robot_damage.mp3");
    this.deathSound = new Audio("/audio/robot_death.mp3");
    this.attackSound = new Audio("/audio/robot_attack.mp3");

    this.activationInterval = setInterval(() => {
      this.checkActivation();
    }, 100);
    this.energy = 100;
  }

  checkActivation() {
    if (!this.world.ready) return;
    if (!this.isActivated && this.world.character.x >= this.x - 300) {
      this.isActivated = true;
      this.chargeTargetX = this.world.character.x + 200;

      this.animateOnce(this.IMAGES_JUMPING, 100);

      // TODO: Boss polish — create a "Matrix effect" near the jump apex by
      // temporarily lowering acceleration, as if the robot manipulates gravity.
      this.speedY = -12;

      this.entranceInterval = setInterval(() => {
        this.jumpEntrance();
      }, 1000 / 60);
    }
  }

  jumpEntrance() {
    this.applyGravity();

    if (this.speedY > 0 && this.y >= this.groundY) {
      this.y = this.groundY;
      this.speedY = 0;
      clearInterval(this.entranceInterval);

      setTimeout(() => {
        this.animateOnce(this.IMAGES_TURNING_TO_RUN, 200);

        setTimeout(() => {
          this.isFighting = true;
          this.fightState = "prepareAttack";
        }, 900);
      }, 500);
    }
  }

  hitByFruit() {
    this.energy = Math.max(0, this.energy - 34);
    this.updateRobotEnergyBar();

    if (this.energy <= 0) {
      this.die();
      return;
    }

    this.damageSound.currentTime = 0;
    this.damageSound.play();

    this.fightState = "prepareAttack";
  }

  updateRobotEnergyBar() {
    const energyBar = document.querySelector(".r-energy");
    const maxHeight = 170;
    const bottom = 202;

    const height = (this.energy / 100) * maxHeight;

    energyBar.style.height = `${height}px`;
    energyBar.style.top = `${bottom - height}px`;
  }

  die() {
    if (this.isDead) return;

    this.isDead = true;
    this.stopAnimation();

    this.deathSound.currentTime = 0;
    this.deathSound.play();

    this.animateOnce(this.IMAGES_DYING, 100);

    setTimeout(() => {
      this.world.game.endGame();
    }, 5000);
  }

  updateFightBehaviour() {
    if (!this.isFighting || this.isDead) return;

    if (this.fightState === "prepareAttack") {
      this.prepareAttack();
    } else if (this.fightState === "charge") {
      this.chargeTowardsTarget();
    } else if (this.fightState === "waiting") {
      this.checkNextAttack();
    }
  }

  chargeTowardsTarget() {
    const character = this.world.character;
    const distance = Math.abs(this.x - character.x);

    this.faceCharacter(character);

    if (character.x < this.x) {
      this.x -= 2;
    } else {
      this.x += 2;
    }

    if (distance <= 80) {
      this.fightState = "waiting";
      this.setAnimation(this.IMAGES_ATTACKING, 100);

      console.log("robot reached attack distance");
    }
  }

  checkNextAttack() {
    const distance = Math.abs(this.x - this.world.character.x);

    if (distance > 250) {
      this.fightState = "prepareAttack";
    }
  }

  // startTurn() {
  //   if (this.isTurning) return;

  //   this.isTurning = true;
  //   this.animateOnce(this.IMAGES_TURNING_TO_RUN, 200);

  //   setTimeout(() => {
  //     if (this.isDead) return;

  //     this.direction *= -1;

  //     this.isTurning = false;
  //     this.fightState = "turned";
  //     this.setAnimation(this.IMAGES_ATTACKING);

  //     console.log("robot turned");
  //   }, 900);
  // }

  faceCharacter(character) {
    this.direction = character.x < this.x ? 1 : -1;
  }

  runTowardsCharacter() {
    this.setAnimation(this.IMAGES_RUN_ATTACKING, 100);
    this.move(2);
  }

  throwBomb() {
    const now = Date.now();

    if (now - this.lastBombThrow < this.bombCooldown) return;
    this.lastBombThrow = now;

    const bomb = new Bomb(
      this.x + this.width / 2 - 25,
      this.y + 100,
      this.direction * -1,
    );

    this.world.bombs.push(bomb);
  }

  prepareAttack() {
    const character = this.world.character;

    this.faceCharacter(character);
    this.throwBomb();

    this.fightState = "charge";
    this.setAnimation(this.IMAGES_RUN_ATTACKING, 100);
  }
}
