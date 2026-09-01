class IntroScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.lastTime = 0;
    this.elapsedTime = 0;
    this.animationFrame = null;
    this.titleImage = this.loadImage("./img/icons/title.png");
    this.pressEnterImage = this.loadImage("./img/icons/press_enter.png");
    this.scrollingText = new ScrollingText(
      this.ctx,
      "WELCOME TO ANGRY FORREST - USE ARROW KEYS TO MOVE - PRESS ENTER TO START",
      { height: 38, speed: 42, y: this.canvas.height - 28 },
    );
  }

  loadImage(path) {
    const image = new Image();
    image.src = path;
    return image;
  }

  start() {
    this.lastTime = performance.now();
    this.animationFrame = requestAnimationFrame((time) => this.loop(time));
  }

  stop() {
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }

  loop(time) {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    this.update(deltaTime);
    this.draw();
    this.animationFrame = requestAnimationFrame((nextTime) =>
      this.loop(nextTime),
    );
  }

  update(deltaTime) {
    this.elapsedTime += deltaTime;
    this.scrollingText.update(deltaTime);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = "#07120a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawCentered(this.titleImage, 510, 225);
    this.drawPressEnter();
    this.scrollingText.draw();
  }

  drawPressEnter() {
    const wobbleDuration = 1000;
    const wobbleInterval = 3000;
    const wobbleTime = this.elapsedTime - wobbleInterval;
    const isWobbling =
      wobbleTime >= 0 && wobbleTime % wobbleInterval < wobbleDuration;
    const progress = isWobbling
      ? (wobbleTime % wobbleInterval) / wobbleDuration
      : 0;
    const angle = isWobbling
      ? Math.sin(progress * Math.PI * 6) * 0.05 * (1 - progress)
      : 0;

    this.drawCentered(this.pressEnterImage, 330, 105, 255, angle);
  }

  drawCentered(image, width, height, y = 52, angle = 0) {
    if (!image.complete) return;

    const x = (this.canvas.width - width) / 2;
    if (angle === 0) {
      this.ctx.drawImage(image, x, y, width, height);
      return;
    }

    this.ctx.save();
    this.ctx.translate(x + width / 2, y + height / 2);
    this.ctx.rotate(angle);
    this.ctx.drawImage(image, -width / 2, -height / 2, width, height);
    this.ctx.restore();
  }
}
