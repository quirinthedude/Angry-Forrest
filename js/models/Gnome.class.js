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
    //remove in time
    this.collisionDebug = true;
    //
  }

  moveGnome() {
    setInterval(() => {
      if (this.isKnockedOut) return;

      if (this.x < this.minX) {
        this.direction = 1;
      } else if (this.x > this.maxX) {
        this.direction = -1;
      }
      this.move(this.speed);
    }, 20); // Move every 2 milliseconds
  }

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

  updateKnockout() {
    if (!this.isKnockedOut) return;

    this.x += this.speedX * this.direction;
    this.y += this.speedY;
    this.speedY += this.acceleration;
  }
}
