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
    this.loadImages(this.IMAGES_WALKING, 22, 150);
    this.x = x;
    this.y = y;
    this.mirrorX = true;
    this.animate(this.IMAGES_WALKING); // Start
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
        this.moveLeft();
      } else {
        this.moveRight();
      }
    }, 2); // Move every 25 milliseconds
  }
}
