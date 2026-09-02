class GameOver {
  state = "gameOverIn";
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
      this.gameOverHeight =
        this.width * (this.gameOverImage.height / this.gameOverImage.width);
      this.gameOverReady = true;
      this.updateReadyState();
    };
    this.pressEnterImage.onload = () => {
      this.pressEnterHeight =
        this.width * (this.pressEnterImage.height / this.pressEnterImage.width);
      this.pressEnterReady = true;
      this.updateReadyState();
    };
  }

  updateReadyState() {
    this.ready = this.gameOverReady && this.pressEnterReady;
  }

  update() {
    if (!this.ready) return;

    if (this.state === "gameOverIn") {
      this.moveGameOverIn();
    } else if (this.state === "gameOverWait") {
      this.waitGameOver();
    } else if (this.state === "gameOverOut") {
      this.moveGameOverOut();
    } else if (this.state === "pressEnterIn") {
      this.movePressEnterIn();
    } else if (this.state === "pressEnterWobble") {
      this.waitPressEnter();
    } else if (this.state === "pressEnterOut") {
      this.movePressEnterOut();
    }
  }

  moveGameOverIn() {
    const targetX = (this.canvas.width - this.width) / 2;

    this.x -= this.speed;

    if (this.x <= targetX) {
      this.x = targetX;
      this.state = "gameOverWait";
      this.waitStartedAt = Date.now();
    }
  }

  waitGameOver() {
    if (Date.now() - this.waitStartedAt >= 3000) {
      this.state = "gameOverOut";
    }
  }

  moveGameOverOut() {
    this.x -= this.speed;

    if (this.x + this.width < 0) {
      this.state = "pressEnterIn";
      this.x = this.canvas.width;
    }
  }

  movePressEnterIn() {
    const targetX = (this.canvas.width - this.width) / 2;

    this.x -= this.speed;

    if (this.x <= targetX) {
      this.x = targetX;
      this.state = "pressEnterWobble";
      this.waitStartedAt = Date.now();
    }
  }

  waitPressEnter() {
    if (Date.now() - this.waitStartedAt >= 3000) {
      this.state = "pressEnterOut";
    }
  }

  movePressEnterOut() {
    this.x -= this.speed;

    if (this.x + this.width < 0) {
      this.state = "gameOverIn";
      this.x = this.canvas.width;
    }
  }

  draw() {
    if (!this.ready) return;

    if (this.state.startsWith("gameOver")) {
      this.ctx.drawImage(
        this.gameOverImage,
        this.x,
        this.y,
        this.width,
        this.gameOverHeight,
      );
    } else {
      this.drawPressEnter();
    }
  }

  drawPressEnter() {
    if (this.state !== "pressEnterWobble") {
      this.ctx.drawImage(
        this.pressEnterImage,
        this.x,
        this.y,
        this.width,
        this.pressEnterHeight,
      );
      return;
    }

    const angle = Math.sin(Date.now() / 120) * 0.05;
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.pressEnterHeight / 2;

    this.ctx.save();
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(angle);

    this.ctx.drawImage(
      this.pressEnterImage,
      -this.width / 2,
      -this.pressEnterHeight / 2,
      this.width,
      this.pressEnterHeight,
    );

    this.ctx.restore();
  }
}
