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
  }

  update() {
    if (this.state === "rise") {
      this.raiseCharacter();
    }
  }

  raiseCharacter() {
    this.character.y -= 2;

    if (this.character.y <= this.character.groundY) {
      this.character.y = this.character.groundY;
      this.state = "ready";
    }
  }

  draw() {
    console.log("");
    // ./png/icons/get_ready.png
  }
}
