class Game {
  state = "intro";
  world = null;

  constructor(canvas) {
    this.canvas = canvas;
    this.intro = new IntroScene(canvas);
    this.setGameplayUiVisible(false);
    this.titleSong = new Audio("/audio/title_song.mp3");
  }

  start() {
    this.intro.start();
    this.titleSong.currentTime = 0;
    this.playTitleSong();
  }

  playTitleSong() {
    this.titleSong.play().catch(() => {
      // Autoplay is blocked until the user interacts with the document.
    });
  }

  startWorld() {
    this.intro.stop();
    this.world = new World(this.canvas);
    world = this.world;
    window.world = this.world;
    this.state = "playing";
    this.setGameplayUiVisible(true);
    this.world.draw();
  }

  setGameplayUiVisible(visible) {
    const energyBar = document.querySelector(".character-energy");
    if (energyBar) energyBar.hidden = !visible;
  }

  handleKeyDown(event) {
    if (this.state === "intro") {
      if (event.key === "Enter") {
        event.preventDefault();
        this.playTitleSong();
        this.startWorld();
      }
      return;
    }

    if (event.key === "ArrowLeft") this.world.keyboard.left = true;
    if (event.key === "ArrowRight") this.world.keyboard.right = true;
    if (event.key === "ArrowUp") this.world.keyboard.jump = true;
  }

  handleKeyUp(event) {
    if (this.state !== "playing") return;

    if (event.key === "ArrowLeft") this.world.keyboard.left = false;
    if (event.key === "ArrowRight") this.world.keyboard.right = false;
    if (event.key === "ArrowUp") this.world.keyboard.jump = false;
  }
}
