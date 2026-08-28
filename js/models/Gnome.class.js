class Gnome extends MovableObject {
  height = 120;
  width = 120;
  leftOffset = 40;
  rightOffset = 40;
  topOffset = 35;
  bottomOffset = 0;
  nativeDirection = 1;

  IMAGES_IDLE = createAnimationImages("./img/gnome/Idle/Gnome_Idle_", 18);
  IMAGES_IDLE_BLINKING = createAnimationImages(
    "./img/gnome/Idle Blinking/Gnome_Idle Blinking_",
    18,
  );
  IMAGES_WALKING = createAnimationImages(
    "./img/gnome/Walking/Gnome_Walking_",
    24,
  );
  IMAGES_RUNNING = createAnimationImages(
    "./img/gnome/Running/Gnome_Running_",
    12,
  );
  IMAGES_ATTACKING = createAnimationImages(
    "./img/gnome/Slashing/Gnome_Slashing_",
    12,
  );
  IMAGES_ATTACKING_AIR = createAnimationImages(
    "./img/gnome/Slashing in The Air/Gnome_Slashing in The Air_",
    12,
  );
  IMAGES_THROWING = createAnimationImages(
    "./img/gnome/Throwing/Gnome_Throwing_",
    12,
  );
  IMAGES_THROWING_AIR = createAnimationImages(
    "./img/gnome/Throwing in The Air/Gnome_Throwing in The Air_",
    12,
  );
  IMAGES_HURT = createAnimationImages("./img/gnome/Hurt/Gnome_Hurt_", 12);
  IMAGES_JUMPING = createAnimationImages(
    "./img/gnome/Jump Loop/Gnome_Jump Loop_",
    6,
  );
  IMAGES_JUMP_START = createAnimationImages(
    "./img/gnome/Jump Start/Gnome_Jump Start_",
    6,
  );
  IMAGES_KICKING = createAnimationImages(
    "./img/gnome/Kicking/Gnome_Kicking_",
    12,
  );
  IMAGES_RUN_SLASHING = createAnimationImages(
    "./img/gnome/Run Slashing/Gnome_Run Slashing_",
    12,
  );
  IMAGES_RUN_THROWING = createAnimationImages(
    "./img/gnome/Run Throwing/Gnome_Run Throwing_",
    12,
  );
  IMAGES_SLIDING = createAnimationImages(
    "./img/gnome/Sliding/Gnome_Sliding_",
    6,
  );
  IMAGES_FALLING_DOWN = createAnimationImages(
    "./img/gnome/Falling Down/Gnome_Falling Down_",
    6,
  );
  IMAGES_DYING = createAnimationImages("./img/gnome/Dying/Gnome_Dying_", 15);

  constructor(x, y, minX, maxX, world) {
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
    this.minX = minX;
    this.maxX = maxX;
    // Jede Gnome-Instanz erhält beim Erzeugen eine eigene, konstante Laufgeschwindigkeit.
    this.speed = 0.6 + Math.random() * 0.3;
    this.animate(this.IMAGES_WALKING, 25); // Start
    this.moveGnome();
    //remove in time
    this.collisionDebug = true;
    //
  }

  moveGnome() {
    setInterval(() => {
      if (this.x < this.minX) {
        this.direction = 1;
      } else if (this.x > this.maxX) {
        this.direction = -1;
      }
      this.move(this.speed);
    }, 20); // Move every 2 milliseconds
  }
}
