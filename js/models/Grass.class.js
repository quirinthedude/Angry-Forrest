class Grass extends MovableObject {
  constructor(path, speed, x) {
    super().loadImage(path);
    this.x = x;
    this.y = 260;
    this.width = 865;
    this.height = 220;
    this.speed = speed;
  }
}
