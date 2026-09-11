class VictoryScene {
  state = "bow";
  waitStartedAt = 0;

  constructor(world) {
    this.world = world;
    this.character = world.character;

    this.startBow();
  }

  startBow() {
    this.character.bow();

    const bowDuration = this.character.IMAGES_BOW.length * 100;

    setTimeout(() => {
      this.state = "waitAfterBow";
      this.waitStartedAt = Date.now();
    }, bowDuration);
  }

  update() {
    if (this.state === "waitAfterBow") {
      this.waitAfterBow();
    } else if (this.state === "sink") {
      this.sinkCharacter();
    }
  }

  waitAfterBow() {
    if (Date.now() - this.waitStartedAt >= 1500) {
      this.state = "sink";
    } //else {
    //   this.state = "finished";
    // }
  }

  sinkCharacter() {
    this.character.y += 2;

    if (this.character >= this.world.canvas.height) {
      this.state = "finished";
    }
  }
}
