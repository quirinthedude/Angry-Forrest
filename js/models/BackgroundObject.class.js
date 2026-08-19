class BackgroundObject extends MovableObject {
  speed = 1;

  constructor(path, speed, x) {
    super().loadImage(path);
    this.x = x;
    this.y = 0;
    this.width = 866;
    this.height = 618;
    this.speed = speed; // Set the initial speed of the background object
  }
}
