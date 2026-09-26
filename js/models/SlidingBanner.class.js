class SlidingBanner {
  constructor(
    canvas,
    imagePath,
    width = 420,
    y = 150,
    speed = 10,
    wobble = false,
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.width = width;
    this.y = y;
    this.speed = speed;
    this.wobble = wobble;

    this.x = canvas.width;
    this.isCentered = false;

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
      this.isCentered = true;
      return true;
    }

    return false;
  }

  moveOut() {
    if (!this.ready) return false;

    this.isCentered = false;
    this.x -= this.speed;

    return this.x + this.width < 0;
  }

  draw() {
    if (!this.ready) return;

    if (this.wobble && this.isCentered) {
      this.drawWobbling();
      return;
    }

    this.drawStatic();
  }

  drawStatic() {
    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }

  drawWobbling() {
    const angle = Math.sin(performance.now() / 120) * 0.05;
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(angle);

    this.ctx.drawImage(
      this.image,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height,
    );

    this.ctx.restore();
  }

  reset() {
    this.x = this.canvas.width;
    this.isCentered = false;
  }
}
