/** Represents the animated tree shown after the player wins. */
class GrowingTree extends MovableObject {
  /** Creates a tree aligned to the supplied ground position.
   * @param {number} x Horizontal world position.
   * @param {number} y Reference vertical position.
   */
  width = 350;
  height = 350;
  groundAlignmentOffset = 100;

  IMAGES_GROWING = createAnimationImages("/img/growing_tree/tree_", 10);

  constructor(x, y) {
    super();

    this.x = x;
    this.y = y + this.groundAlignmentOffset;

    this.loadImage(this.IMAGES_GROWING[0]);
    this.loadImages(this.IMAGES_GROWING);
  }

  /** Starts the one-shot growth animation. */
  grow() {
    this.animateOnce(this.IMAGES_GROWING, 180);
  }
}
