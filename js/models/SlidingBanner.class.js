class SlidingBanner {
  constructor(canvas, imagePath, width = 420, y = 150, speed = 10) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.width = width;
    this.y = y;
    this.speed = speed;
    this.x = canvas.width;

    this.ready = false;

    this.image = new Image();
    this.image.src = imagePath;

    this.image.onload = () => {
      this.height = this.width * (this.image.height / this.image.width);
      this.ready = true;
    };
  }

  moveIn() {
    if (!this.ready) return false;

    const targetX = (this.canvas.width - this.width) / 2;

    this.x -= this.speed;

    if (this.x <= targetX) {
      this.x = targetX;
      return true;
    }

    return false;
  }

  moveOut() {
    if (!this.ready) return false;

    this.x -= this.speed;

    if (this.x + this.width < 0) {
      return true;
    }
    return false;
  }

  draw() {
    if (!this.ready) return;

    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}
