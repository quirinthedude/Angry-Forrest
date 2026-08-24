class Golem extends MovableObject {
  height = 120;
  width = 120;
  IMAGES_IDLE = createAnimationImages("./img/golem/Idle/Golem_Idle_", 18);
  IMAGES_IDLE_BLINKING = createAnimationImages(
    "./img/golem/Idle Blinking/Golem_Idle Blinking_",
    18,
  );
  IMAGES_WALKING = createAnimationImages(
    "./img/golem/Walking/Golem_Walking_",
    24,
  );
  IMAGES_RUNNING = createAnimationImages(
    "./img/golem/Running/Golem_Running_",
    12,
  );
  IMAGES_ATTACKING = createAnimationImages(
    "./img/golem/Slashing/Golem_Slashing_",
    12,
  );
  IMAGES_ATTACKING_AIR = createAnimationImages(
    "./img/golem/Slashing in The Air/Golem_Slashing in The Air_",
    12,
  );
  IMAGES_THROWING = createAnimationImages(
    "./img/golem/Throwing/Golem_Throwing_",
    12,
  );
  IMAGES_THROWING_AIR = createAnimationImages(
    "./img/golem/Throwing in The Air/Golem_Throwing in The Air_",
    12,
  );
  IMAGES_HURT = createAnimationImages("./img/golem/Hurt/Golem_Hurt_", 12);
  IMAGES_JUMPING = createAnimationImages(
    "./img/golem/Jump Loop/Golem_Jump Loop_",
    6,
  );
  IMAGES_JUMP_START = createAnimationImages(
    "./img/golem/Jump Start/Golem_Jump Start_",
    6,
  );
  IMAGES_KICKING = createAnimationImages(
    "./img/golem/Kicking/Golem_Kicking_",
    12,
  );
  IMAGES_RUN_SLASHING = createAnimationImages(
    "./img/golem/Run Slashing/Golem_Run Slashing_",
    12,
  );
  IMAGES_RUN_THROWING = createAnimationImages(
    "./img/golem/Run Throwing/Golem_Run Throwing_",
    12,
  );
  IMAGES_SLIDING = createAnimationImages(
    "./img/golem/Sliding/Golem_Sliding_",
    6,
  );
  IMAGES_FALLING_DOWN = createAnimationImages(
    "./img/golem/Falling Down/Golem_Falling Down_",
    6,
  );
  IMAGES_DYING = createAnimationImages("./img/golem/Dying/Golem_Dying_", 15);

  constructor(x, y, world) {
    super();
    this.world = world;
    this.loadImage(this.IMAGES_IDLE[0]);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_IDLE_BLINKING);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_RUNNING);
    this.loadImages(this.IMAGES_ATTACKING);
    this.loadImages(this.IMAGES_ATTACKING_AIR);
    this.loadImages(this.IMAGES_THROWING);
    this.loadImages(this.IMAGES_THROWING_AIR);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_JUMP_START);
    this.loadImages(this.IMAGES_KICKING);
    this.loadImages(this.IMAGES_RUN_SLASHING);
    this.loadImages(this.IMAGES_RUN_THROWING);
    this.loadImages(this.IMAGES_SLIDING);
    this.loadImages(this.IMAGES_FALLING_DOWN);
    this.loadImages(this.IMAGES_DYING);
    this.x = x;
    this.y = y;
    this.mirrorX = true;
    // Jede Golem-Instanz erhält beim Erzeugen eine eigene, konstante Laufgeschwindigkeit.
    this.speed = 0.6 + Math.random() * 0.3;
    this.animate(this.IMAGES_WALKING, 25); // Start
    this.moveGolem();
    //remove in time
    this.collisionDebug = true;
    //
    this.leftOffset = 40;
    this.rightOffset = 40;
  }

  moveGolem() {
    setInterval(() => {
      if (this.x < 10) {
        this.mirrorX = false; // Change direction
      } else if (this.x > 710) {
        this.mirrorX = true; // Change direction
      }
      if (this.mirrorX) {
        this.moveLeft(this.speed);
      } else {
        this.moveRight(this.speed);
      }
    }, 2); // Move every 2 milliseconds
  }
}
