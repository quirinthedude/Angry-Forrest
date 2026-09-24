/** Controls the animated game-over or press-enter overlay. */
class EndGame {
  state = "gameOverIn";
  x;
  y = 150;
  width = 420;
  height;
  speed = 10;
  waitStartedAt = 0;
  ready = false;

  /** Creates an overlay and starts loading its required images.
   * @param {HTMLCanvasElement} canvas Canvas used for rendering.
   * @param {string|null} endGameImagePath Game-over image path.
   * @param {boolean} pressEnterOnly Whether only the press-enter prompt is shown.
   */
  constructor(canvas, endGameImagePath = null, pressEnterOnly = false) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.pressEnterOnly = pressEnterOnly;

    this.pressEnterImage = new Image();
    this.pressEnterImage.src = "./img/icons/press_enter.png";

    this.x = canvas.width;

    if (pressEnterOnly) {
      this.state = "pressEnterIn";
      this.endGameReady = true;
    } else {
      this.endGameImage = new Image();
      this.endGameImage.src = endGameImagePath;

      this.endGameImage.onload = () => {
        this.endGameHeight =
          this.width * (this.endGameImage.height / this.endGameImage.width);
        this.endGameReady = true;
        this.updateReadyState();
      };
    }

    this.pressEnterImage.onload = () => {
      this.pressEnterHeight =
        this.width * (this.pressEnterImage.height / this.pressEnterImage.width);
      this.pressEnterReady = true;
      this.updateReadyState();
    };
  }

  /** Updates readiness after overlay images finish loading. */
  updateReadyState() {
    this.ready = this.endGameReady && this.pressEnterReady;
  }

  /** Advances the overlay state machine by one frame. */
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

  /** Moves the game-over image into its centered position. */
  moveGameOverIn() {
    const targetX = (this.canvas.width - this.width) / 2;

    this.x -= this.speed;

    if (this.x <= targetX) {
      this.x = targetX;
      this.state = "gameOverWait";
      this.waitStartedAt = Date.now();
    }
  }

  /** Waits for the configured game-over display duration. */
  waitGameOver() {
    if (Date.now() - this.waitStartedAt >= 3000) {
      this.state = "gameOverOut";
    }
  }

  /** Moves the game-over image offscreen. */
  moveGameOverOut() {
    this.x -= this.speed;

    if (this.x + this.width < 0) {
      this.state = "pressEnterIn";
      this.x = this.canvas.width;
    }
  }

  /** Moves the press-enter prompt into its centered position. */
  movePressEnterIn() {
    const targetX = (this.canvas.width - this.width) / 2;

    this.x -= this.speed;

    if (this.x <= targetX) {
      this.x = targetX;
      this.state = "pressEnterWobble";
      this.waitStartedAt = Date.now();
    }
  }

  /** Waits for the configured press-enter display duration. */
  waitPressEnter() {
    if (Date.now() - this.waitStartedAt >= 3000) {
      this.state = "pressEnterOut";
    }
  }

  /** Moves the press-enter prompt offscreen and selects the next phase. */
  movePressEnterOut() {
    this.x -= this.speed;

    if (this.x + this.width < 0) {
      this.state = this.pressEnterOnly ? "pressEnterIn" : "gameOverIn";

      this.x = this.canvas.width;
    }
  }

  /** Draws the currently active overlay image. */
  draw() {
    if (!this.ready) return;

    if (this.state.startsWith("gameOver")) {
      this.ctx.drawImage(
        this.endGameImage,
        this.x,
        this.y,
        this.width,
        this.endGameHeight,
      );
    } else {
      this.drawPressEnter();
    }
  }

  /** Draws the press-enter prompt with its optional wobble effect. */
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
