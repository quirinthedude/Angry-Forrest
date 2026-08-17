class BackgroundObject extends MovableObject {
  speed = 1;

  constructor(imagepath, speed, x) {
    super().loadImage(imagepath);
    this.x = x;
    this.y = 0;
    this.width = 866;
    this.height = 618;
    this.speed = speed; // Set the initial speed of the background object
  }
}
