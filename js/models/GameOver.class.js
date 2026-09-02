class GameOver {
  state = "entering";
  x;
  y = 150;
  width = 420;
  height;
  speed = 10;
  waitStartedAt = 0;
  ready = false;

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.gameOverImage = new Image();
    this.gameOverImage.src = "./img/icons/game_over.png";

    this.pressEnterImage = new Image();
    this.pressEnterImage.src = "./img/icons/press_enter.png";

    this.x = canvas.width;

    this.gameOverImage.onload = () => {
      this.height =
        this.width * (this.gameOverImage.height / this.gameOverImage.width);
      this.ready = true;
    };
  }
  update() {
    if (!this.ready) return;

    if (this.state === "entering") {
      this.moveIn();
    } else if (this.state === "waiting") {
      this.wait();
    } else if (this.state === "leaving") {
      this.moveOut();
    }
  }

  moveIn() {
    const targetX = (this.canvas.width - this.width) / 2;

    this.x -= this.speed;

    if (this.x <= targetX) {
      this.x = targetX;
      this.state = "waiting";
      this.waitStartedAt = Date.now();
    }
  }

  wait() {
    if (Date.now() - this.waitStartedAt >= 3000) {
      this.state = "leaving";
    }
  }

  moveOut() {
    this.x -= this.speed;

    if (this.x + this.width < 0) {
      this.state = "finished";
    }
  }

  draw() {
    if (!this.ready || this.state === "finished") return;

    this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
  }
}
