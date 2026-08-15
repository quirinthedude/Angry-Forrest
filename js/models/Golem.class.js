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
  }
}
