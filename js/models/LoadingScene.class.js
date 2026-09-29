/** Renders a loading indicator while the world assets are being prepared. */
class LoadingScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.animationFrame = null;
    this.lastTime = 0;
    this.angle = 0;
  }
  /** Starts the loading animation. */
  start() {
    this.lastTime = performance.now();
    this.animationFrame = requestAnimationFrame((time) => this.loop(time));
  }

  /** Stops the loading animation. */
  stop() {
    cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;
  }

  /** Updates and renders one loading frame. */
  loop(time) {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;

    this.angle += deltaTime * 0.006;
    this.draw();

    this.animationFrame = requestAnimationFrame((nextTime) =>
      this.loop(nextTime),
    );
  }

  /** Draws the loading screen and animated spinner. */
  draw() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = "#07120a";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    this.ctx.translate(centerX, centerY - 20);
    this.ctx.rotate(this.angle);

    this.ctx.beginPath();
    this.ctx.arc(0, 0, 34, 0, Math.PI * 1.5);
    this.ctx.lineWidth = 8;
    this.ctx.strokeStyle = "#9b7a45";
    this.ctx.stroke();

    this.ctx.restore();

    this.ctx.fillStyle = "#f3e5b5";
    this.ctx.font = '32px "Grenze Gotisch"';
    this.ctx.textAlign = "center";
    this.ctx.fillText("LOADING...", centerX, centerY + 70);
  }
}
