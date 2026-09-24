/** Represents a patrolling gnome enemy. */
class Gnome extends MovableObject {
  height = 120;
  width = 120;
  leftOffset = 40;
  rightOffset = 40;
  topOffset = 35;
  bottomOffset = 0;
  nativeDirection = 1;
  isKnockedOut = false;

  IMAGES_IDLE = createAnimationImages("./img/gnome/Idle/Gnome_Idle_", 18);
  IMAGES_WALKING = createAnimationImages(
    "./img/gnome/Walking/Gnome_Walking_",
    24,
  );
  IMAGES_HURT = createAnimationImages("./img/gnome/Hurt/Gnome_Hurt_", 12);

  /** Creates a gnome with patrol bounds.
   * @param {number} x Initial horizontal position.
   * @param {number} y Initial vertical position.
   * @param {number} minX Left patrol boundary.
   * @param {number} maxX Right patrol boundary.
   * @param {World} world Owning game world.
   */
  constructor(x, y, minX, maxX, world) {
    super();
    this.world = world;
    this.loadImage(this.IMAGES_IDLE[0]);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_HURT);
    this.deathSound = new Audio("./audio/gnome_death.mp3");
    this.x = x;
    this.y = y;
    this.minX = minX;
    this.maxX = maxX;
    // Jede Gnome-Instanz erhält beim Erzeugen eine eigene, konstante Laufgeschwindigkeit.
    this.speed = 0.6 + Math.random() * 0.3;
    this.animate(this.IMAGES_WALKING, 25); // Start
    this.moveGnome();
    this.collisionDebug = true;
  }

  /** Starts the gnome patrol interval. */
  moveGnome() {
    this.movementInterval = setInterval(() => {
      if (!this.world.ready || this.isKnockedOut) return;

      if (this.x < this.minX) {
        this.direction = 1;
      } else if (this.x > this.maxX) {
        this.direction = -1;
      }
      this.move(this.speed);
    }, 20); // Move every 2 milliseconds
  }

  /** Starts the gnome knockout reaction after a fruit hit.
   * @param {number} direction Direction in which the gnome is knocked back.
   */
  hitByFruit(direction) {
    if (this.isKnockedOut) return;

    this.isKnockedOut = true;

    this.stopAnimation();
    this.animateOnce(this.IMAGES_HURT, 40);

    this.deathSound.currentTime = 0;
    this.deathSound.play();

    this.direction = direction;
    this.speedX = 6;
    this.speedY = -14;
    this.acceleration = 0.6;
  }

  /** Advances the airborne knockout movement. */
  updateKnockout() {
    if (!this.isKnockedOut) return;

    this.x += this.speedX * this.direction;
    this.y += this.speedY;
    this.speedY += this.acceleration;
  }

  /** Stops patrol and sprite animation timers. */
  stop() {
    clearInterval(this.movementInterval);
    this.stopAnimation();
  }
}
