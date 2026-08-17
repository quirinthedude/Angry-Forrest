class BackgroundObject extends MovableObject {
  speed = 1;

  constructor(imagepath, speed, x) {
    super().loadImage(imagepath);
    this.x = x;
    this.y = 0;
    this.width = 866;
    this.height = 618;
    this.speed = speed; // Set the initial speed of the background object
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
