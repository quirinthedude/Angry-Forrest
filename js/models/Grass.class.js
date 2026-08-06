class Grass extends MovableObject {
  constructor() {
    super().loadImage("/img/landscape/Ground.png");
    this.x = 0;
    this.y = 260;
    this.width = 720;
    this.height = 220; // Adjust the height as needed
  }
}
