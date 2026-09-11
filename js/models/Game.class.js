/**
 * Coordinates the overarching lifecycle of the game.
 *
 * The normal lifecycle moves from `intro` to `loading`, then to `playing` and
 * finally to `gameOver`. An asset-loading error may leave the game in the
 * `loading` state because it is handled within that phase. Game coordinates
 * the intro scene, world creation, asset loading, audio, gameplay UI and
 * keyboard input for these states.
 */
class Game {
  /**
   * Current lifecycle state of the game.
   *
   * @type {"intro"|"loading"|"playing"|"gameOver"|"gameWon"}
   */
  state = "intro";

  /**
   * Active game world, created when the game leaves the intro.
   *
   * @type {World|null}
   */
  world = null;

  /**
   * Active end-game overlay, created when the game ends.
   *
   * @type {EndGame|null}
   */
  endScreen = null;

  /** Active of the victory-Scene  overlay
   *
   * @type {null | VictoryScene}
   */
  victoryScene = null;

  /**
   * Creates the lifecycle coordinator for the supplied game canvas.
   *
   * The constructor prepares the intro scene, hides the gameplay UI and
   * creates the audio elements used throughout the lifecycle.
   *
   * @param {HTMLCanvasElement} canvas Canvas on which the game is rendered.
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.intro = new IntroScene(canvas);
    this.setGameplayUiVisible(false);

    this.titleSong = new Audio("/audio/title_song.mp3");
    this.gameSong = new Audio("./audio/game_song.mp3");
    this.funeralSong = new Audio("./audio/Mourning Brass - 2.mp3");
  }

  /**
   * Starts the intro phase and its title music.
   *
   * @returns {void}
   */
  start() {
    this.intro.start();
    this.titleSong.currentTime = 0;
    this.playTitleSong();
  }

  /**
   * Attempts to play the title music during the intro phase.
   *
   * Browsers may reject playback until the user interacts with the document;
   * that rejection is intentionally handled without interrupting the game.
   *
   * @returns {void}
   */
  playTitleSong() {
    this.titleSong.play().catch(() => {
      // Autoplay is blocked until the user interacts with the document.
    });
  }

  /**
   * Creates the world and transitions from the intro to active gameplay.
   *
   * The game first enters `loading`, creates the world and waits
   * asynchronously for all world assets. Only after that wait succeeds are
   * the intro stopped, gameplay music started, the state set to `playing`,
   * the gameplay UI shown and rendering started.
   *
   * @returns {Promise<void>} Promise that resolves after loading succeeds or
   * after a load failure has been handled within the method.
   */
  async startWorld() {
    if (this.state === "loading") return;

    this.state = "loading";
    this.world = new World(this.canvas, this);

    try {
      await this.world.waitForAssets();
    } catch (error) {
      console.error("Could not load game assets: ", error);
      return;
    }

    this.intro.stop();
    this.startGameSong();

    this.state = "playing";
    this.setGameplayUiVisible(true);
    this.world.draw();
  }

  /**
   * Shows or hides the gameplay energy bars.
   *
   * @param {boolean} visible Whether the gameplay UI should be visible.
   * @returns {void}
   */
  setGameplayUiVisible(visible) {
    const energyBar = document.querySelector(".character-energy");
    if (energyBar) energyBar.hidden = !visible;
    const energyBarR = document.querySelector(".robot-energy");
    if (energyBarR) energyBarR.hidden = !visible;
  }

  /**
   * Handles keyboard input according to the current lifecycle state.
   *
   * During `intro`, only Enter starts the world. During `playing`, movement,
   * jumping and throwing input is forwarded to the world's keyboard state.
   * Input is ignored in all other states.
   *
   * @param {KeyboardEvent} event Keyboard event received from the window.
   * @returns {void}
   */
  handleKeyDown(event) {
    if (this.state === "intro") {
      if (event.key === "Enter") {
        event.preventDefault();
        this.playTitleSong();
        this.startWorld();
      }
      return;
    }

    if (this.state !== "playing") return;

    if (event.key === "ArrowLeft") this.world.keyboard.left = true;
    if (event.key === "ArrowRight") this.world.keyboard.right = true;
    if (event.key === "ArrowUp") this.world.keyboard.jump = true;
    if (event.code === "Space") this.world.keyboard.throw = true;
  }

  /**
   * Releases gameplay input according to the current lifecycle state.
   *
   * Key-up events are processed only while the game is `playing`; in all
   * other states they are ignored.
   *
   * @param {KeyboardEvent} event Keyboard event received from the window.
   * @returns {void}
   */
  handleKeyUp(event) {
    if (this.state !== "playing") return;

    if (event.key === "ArrowLeft") this.world.keyboard.left = false;
    if (event.key === "ArrowRight") this.world.keyboard.right = false;
    if (event.key === "ArrowUp") this.world.keyboard.jump = false;
    if (event.code === "Space") this.world.keyboard.throw = false;
  }

  /**
   * Transitions the game to the game-over state.
   *
   * Repeated calls are ignored once the game is already over. The gameplay
   * music is stopped, the funeral music starts and the end-game overlay is
   * created for the world to render.
   *
   * @returns {void}
   */
  endGame() {
    if (this.state === "gameOver") return;

    this.state = "gameOver";

    this.gameSong.pause();
    this.gameSong.currentTime = 0;

    this.funeralSong.currentTime = 0;
    this.funeralSong.play();

    this.endScreen = new EndGame(this.canvas, "./img/icons/game_over.png");
  }

  /**
   * Stops the title music and starts looping gameplay music.
   *
   * @returns {void}
   */
  startGameSong() {
    this.titleSong.pause();
    this.titleSong.currentTime = 0;

    this.gameSong.loop = true;
    this.gameSong.play();
  }

  /**
   * Transitions active gameplay to the victory state.
   *
   * @returns {void}
   */
  winGame() {
    if (this.state !== "playing") return;

    this.state = "gameWon";
    this.victoryScene = new VictoryScene(this.world);
  }
}
