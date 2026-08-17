class Grass extends MovableObject {
  constructor(speed, x) {
    super().loadImage("/img/landscape/Ground.png");
    this.x = x;
    this.y = 260;
    this.width = 720;
    this.height = 220; // Adjust the height as needed
    this.speed = speed; // Set the initial speed of the grass object
    // this.animate();
  }
  animate() {
    // setInterval(() => {
    this.x -= this.speed;
    if (this.x <= -this.width) {
      this.x += this.width * 2;
    }
    // }, 1000 / 60); // 60 frames per second
  }
}
