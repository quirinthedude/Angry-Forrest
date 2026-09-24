/** Represents a ground layer tile rendered with parallax movement. */
class Grass extends MovableObject {
  /** Creates a ground tile at the supplied world position.
   * @param {string} path Ground image path.
   * @param {number} parallaxFactor Relative camera movement factor.
   * @param {number} x Horizontal world position.
   */
  constructor(path, parallaxFactor, x) {
    super().loadImage(path);
    this.x = x;
    this.y = 260;
    this.width = 865;
    this.height = 220;
    this.parallaxFactor = parallaxFactor;
  }
}
