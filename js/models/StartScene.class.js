/** Coordinates the character entrance and get-ready banner before gameplay. */
class StartScene {
  state = "starting";
  duration = 2000;
  startedAt = performance.now();
  state = "rise";

  /**
   * Creates the start scene and positions the character below the canvas.
   *
   * @param {World} world World whose gameplay is about to start.
   */
  constructor(world) {
    this.world = world;
    this.character = world.character;

    this.character.y = world.canvas.height;
    this.character.speedY = 0;
    this.getReady = new SlidingBanner(
      world.canvas,
      "./img/icons/get_ready.png",
    );
  }

  /** Advances the character entrance and banner state machine. */
  update() {
    if (this.state === "rise") {
      this.raiseCharacter();
    } else if (this.state === "bannerIn") {
      if (this.getReady.moveIn()) {
        this.state = "wait";
        this.waitStartedAt = performance.now();
      }
    } else if (this.state === "wait") {
      this.wait();
    } else if (this.state === "bannerOut") {
      if (this.getReady.moveOut()) {
        this.world.game.finishWorldActivation();
      }
    }
  }

  /** Raises the character to ground level and starts the banner entrance. */
  raiseCharacter() {
    this.character.y -= 2;

    if (this.character.y <= this.character.groundY) {
      this.character.y = this.character.groundY;
      this.state = "bannerIn";
      // this.world.game.finishWorldActivation();
    }
  }

  /** Draws the get-ready banner in its current position. */
  draw() {
    this.getReady.draw();
  }

  /** Starts moving the banner out after the configured wait period. */
  wait() {
    if (performance.now() - this.waitStartedAt >= 1000) {
      this.state = "bannerOut";
    }
  }
}
