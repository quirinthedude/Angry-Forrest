class Robot extends MovableObject {
  height = 260;
  width = 228;
  topOffset = 80;
  bottomOffset = 0;
  leftOffset = 20;
  rightOffset = 40;

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
    this.mirrorX = true;
    this.acceleration = 0.5;

    this.activationInterval = setInterval(() => {
      this.checkActivation();
    }, 100);
    //remove in time
    this.collisionDebug = true;
    //
  }

  checkActivation() {
    if (!this.isActivated && this.world.character.x >= this.x - 300) {
      this.isActivated = true;

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
          this.animate(this.IMAGES_RUN_ATTACKING, 100);
        }, 800);
      }, 500);
    }
  }
}
