class BackgroundObject extends MovableObject {
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
