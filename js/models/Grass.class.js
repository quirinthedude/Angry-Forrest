class Grass extends MovableObject {
  constructor(path, parallaxFactor, x) {
    super().loadImage(path);
    this.x = x;
    this.y = 260;
    this.width = 865;
    this.height = 220;
    this.parallaxFactor = parallaxFactor;
  }
}
