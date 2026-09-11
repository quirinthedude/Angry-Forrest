class GrowingTree extends MovableObject {
  width = 350;
  height = 350;

  IMAGES_GROWING = createAnimationImages("/img/growing_tree/tree_", 10);

  constructor(x, y) {
    super();

    this.x = x;
    this.y = y + 100;

    this.loadImage(this.IMAGES_GROWING[0]);
    this.loadImages(this.IMAGES_GROWING);
  }

  grow() {
    this.animateOnce(this.IMAGES_GROWING, 180);
  }
}
