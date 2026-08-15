class Golem extends MovableObject {
  height = 120;
  width = 120;
  IMAGES_WALKING = createAnimationImages(
    "/img/golem/Walking/Golem_Walking_",
    22,
  );

  constructor(x, y) {
    super();
    this.loadImage(this.IMAGES_WALKING[0]);
    this.loadImages(this.IMAGES_WALKING, 22, 50);
    this.x = x;
    this.y = y;
    this.mirrorX = true;
    // Jede Golem-Instanz erhält beim Erzeugen eine eigene, konstante Laufgeschwindigkeit.
    this.speed = 0.6 + Math.random() * 0.3;
    this.animate(this.IMAGES_WALKING, 25); // Start
    this.moveGolem();
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
