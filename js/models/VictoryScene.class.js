class VictoryScene {
  state = "bow";
  waitStartedAt = 0;

  constructor(world) {
    this.world = world;
    this.character = world.character;
    this.gameEndSong = "/audio/end_of_game.mp3";

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
    }
  }

  waitAfterBow() {
    if (Date.now() - this.waitStartedAt >= 1500) {
      this.state = "finished";
    }
  }
}
