class StartScene {
  state = "starting";
  duration = 2000;
  startedAt = performance.now();
  state = "rise";

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

  update() {
    const elapsed = performance.now() - this.startedAt;
    const progress = Math.min(elapsed / this.duration);
    if (this.state === "rise") {
      this.raiseCharacter();
    } else if (this.state === "bannerIn") {
      if (this.getReady.moveIn()) {
        this.state = "wait";
        this.waitStartdedAt = performance.now();
      }
    } else if (this.state === "bannerOut") {
      if (this.getReady.moveOut()) {
        this.world.game.finishWorldActivation();
      }
    }
  }

  raiseCharacter() {
    this.character.y -= 2;

    if (this.character.y <= this.character.groundY) {
      this.character.y = this.character.groundY;
      this.state = "ready";
      // this.world.game.finishWorldActivation();
    }
  }

  draw() {
    this.getReady.draw();
  }

  wait() {
    if (performance.now() - this.waitStartdedAt >= 1000) {
      this.state = bannerOut();
    }
  }
}
