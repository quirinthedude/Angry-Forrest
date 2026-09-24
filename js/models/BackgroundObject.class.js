/** Represents one horizontally scrolling background layer tile. */
class BackgroundObject extends MovableObject {
  /** Creates a background tile at the supplied world position.
   * @param {string} path Background image path.
   * @param {number} parallaxFactor Relative camera movement factor.
   * @param {number} x Horizontal world position.
   */
  parallaxFactor = 1;

  constructor(path, parallaxFactor, x) {
    super().loadImage(path);
    this.x = x;
    this.y = 0;
    this.width = 866;
    this.height = 618;
    this.parallaxFactor = parallaxFactor; // Set the initial speed of the background object
  }
}
