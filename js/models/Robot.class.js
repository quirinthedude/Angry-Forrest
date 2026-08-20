class Robot extends MovableObject {
  height = 160;
  width = 160;
  IMAGES_IDLE = createAnimationImages("./img/robot-boss/Idle/idle_", 9);
  IMAGES_WALKING = createAnimationImages("./img/robot-boss/Walk/Walk_", 12);
  IMAGES_RUNNING = createAnimationImages("./img/robot-boss/Run/Run_", 12);
  IMAGES_RUN_ATTACKING = createAnimationImages(
    "./img/robot-boss/Run_Attack/Run_Attack_",
    12,
  );
  IMAGES_RUN_SHOOTING = createAnimationImages(
    "./img/robot-boss/Run_Shot/Run_Shot_",
    12,
  );
  IMAGES_ATTACKING = createAnimationImages(
    "./img/robot-boss/Attack/Attack_",
    18,
  );
  IMAGES_SHOOTING = createAnimationImages("./img/robot-boss/Shot/Shot_", 16);
  IMAGES_JUMPING = createAnimationImages("./img/robot-boss/Jump/Jump_", 13);
  IMAGES_SITTING = createAnimationImages("./img/robot-boss/Sit/Sit_", 15);
  IMAGES_BOMBING = createAnimationImages("./img/robot-boss/Bomb/Bomb_", 20);
  IMAGES_TURNING_TO_RUN = createAnimationImages(
    "./img/robot-boss/Turn_to_Run/Turn_to_run_",
    4,
  );
  IMAGES_TURNING_TO_WALK = createAnimationImages(
    "./img/robot-boss/Turn_to_walk/Turn_to_walk_",
    4,
  );
  IMAGES_DYING = createAnimationImages("./img/robot-boss/Death/Death_", 15);

  constructor(x, y) {
    super();
    this.loadImage(this.IMAGES_IDLE[0]);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_RUNNING);
    this.loadImages(this.IMAGES_RUN_ATTACKING);
    this.loadImages(this.IMAGES_RUN_SHOOTING);
    this.loadImages(this.IMAGES_ATTACKING);
    this.loadImages(this.IMAGES_SHOOTING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_SITTING);
    this.loadImages(this.IMAGES_BOMBING);
    this.loadImages(this.IMAGES_TURNING_TO_RUN);
    this.loadImages(this.IMAGES_TURNING_TO_WALK);
    this.loadImages(this.IMAGES_DYING);
    this.animate(this.IMAGES_IDLE, 100);
    this.x = x;
    this.y = y;
    this.mirrorX = true;
  }
}
