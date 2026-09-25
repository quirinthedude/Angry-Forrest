/**
 * Coordinates the overarching lifecycle of the game.
 *
 * The normal lifecycle moves from `intro` to `loading`, then to `playing` and
 * finally to `gameOver` or `gameWon`. An asset-loading error may leave the game in the
 * `loading` state because it is handled within that phase. Game coordinates
 * the intro scene, world creation, asset loading, audio, gameplay UI and
 * keyboard input for these states.
 */
class Game {
  /**
   * Current lifecycle state of the game.
   *
   * @type {"intro"|"loading"|"starting"|"playing"|"gameOver"|"gameWon"}
   */
  state = "intro";

  /** Active game-start scene.
   *
   * @type {StartScene|null} Active game-start scene.
   */
  startScene = null;

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

  /** Active victory-scene overlay.
   *
   * @type {null | VictoryScene}
   */
  victoryScene = null;

  /** @type {boolean} Whether game audio is currently muted. */
  isMuted = false;

  /**
   * Creates the lifecycle coordinator for the supplied game canvas.
   *
   * The constructor prepares the intro scene, hides the gameplay UI and
   * creates the audio elements used throughout the lifecycle.
   *
   * @param {HTMLCanvasElement} canvas Canvas on which the game is rendered.
   * @param {DisplayController} display
   */
  constructor(canvas, display) {
    this.canvas = canvas;
    this.display = display;
    this.intro = new IntroScene(canvas);
    this.display.setGameplayUiVisible(false);

    this.titleSong = new Audio("/audio/title_song.mp3");
    this.gameSong = new Audio("./audio/game_song.mp3");
    this.funeralSong = new Audio("./audio/Mourning Brass - 2.mp3");
    this.endOfGameSong = new Audio("./audio/end_of_game.mp3");

    this.isMuted = JSON.parse(localStorage.getItem("isMuted")) ?? false;
    this.display.updateMuteUI(this.isMuted);
  }

  /**
   * Starts the intro phase and its title music.
   *
   * @returns {void}
   */
  start() {
    this.intro.start();
    this.titleSong.currentTime = 0;
    this.applyMutedState();
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
    if (this.display.requiresLandscape()) {
      this.display.updateOrientationPrompt();
      return;
    }

    this.state = "loading";
    this.startGameSong();
    this.world = new World(this.canvas, this);
    this.applyMutedState();
    if (!(await this.loadWorldAssets())) return;
    this.intro.stop();
    this.activateWorld();
  }

  /** Waits for world assets and restores audio when loading fails.
   * @returns {Promise<boolean>} Whether all assets loaded successfully.
   */
  async loadWorldAssets() {
    try {
      await this.world.waitForAssets();
      return true;
    } catch (error) {
      console.error("Could not load game assets: ", error);
      this.gameSong.pause();
      this.gameSong.currentTime = 0;
      return false;
    }
  }

  /** Switches the loaded world into start-scene. */
  activateWorld() {
    this.state = "starting";
    this.startScene = new StartScene(this.world);
    this.world.draw();
  }

  /** Finishes the start scene and enables active gameplay. */
  finishWorldActivation() {
    this.startScene = null;
    this.state = "playing";
    this.display.setGameplayUiVisible(true);
  }

  /**
   * Applies the selected mute state to all currently created game sounds.
   *
   * @returns {void}
   */
  applyMutedState() {
    this.getAudioObjects().forEach((audio) => {
      audio.muted = this.isMuted;
    });
  }

  /**
   * Sets the mute state used by the sound control.
   *
   * @param {boolean} muted Whether game audio should be muted.
   * @returns {void}
   */
  setMuted(muted) {
    this.isMuted = muted;
    localStorage.setItem("isMuted", JSON.stringify(this.isMuted));
    this.applyMutedState();
    this.display.updateMuteUI(this.isMuted);
  }

  /**
   * Returns audio objects belonging to the game and active world actors.
   *
   * @returns {HTMLMediaElement[]} Currently available game audio objects.
   */
  getAudioObjects() {
    const objects = this.getGameAudioObjects();
    this.getWorldAudioObjects().forEach((object) => {
      this.addObjectAudio(objects, object);
    });
    return objects;
  }

  /** Returns audio elements owned directly by the game lifecycle.
   * @returns {HTMLMediaElement[]} Game-level audio elements.
   */
  getGameAudioObjects() {
    return [
      this.titleSong,
      this.gameSong,
      this.funeralSong,
      this.endOfGameSong,
    ];
  }

  /** Returns active world actors whose properties may contain audio.
   * @returns {Object[]} Active world objects.
   */
  getWorldAudioObjects() {
    return [
      this.world?.character,
      ...(this.world?.level?.enemies ?? []),
      ...(this.world?.thrownFruits ?? []),
      ...(this.world?.bombs ?? []),
    ];
  }

  /** Adds media-valued properties from one actor to an audio collection.
   * @param {HTMLMediaElement[]} audioObjects Target audio collection.
   * @param {Object|null|undefined} object Object to inspect.
   */
  addObjectAudio(audioObjects, object) {
    Object.values(object ?? {}).forEach((value) => {
      if (
        typeof HTMLMediaElement !== "undefined" &&
        value instanceof HTMLMediaElement
      ) {
        audioObjects.push(value);
      }
    });
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
      this.handleIntroInput(event);
      return;
    }

    if (this.state === "gameOver" || this.state === "gameWon") {
      this.handleFinishedGameInput(event);
      return;
    }

    if (this.state !== "playing") return;
    this.handlePlayingKeyDown(event);
  }

  /** Returns a finished game to the intro after Enter is pressed.
   * @param {KeyboardEvent} event Keyboard event received from the window.
   */
  handleFinishedGameInput(event) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    this.returnToIntro();
  }

  /** Applies a gameplay keydown event to the shared keyboard state.
   * @param {KeyboardEvent} event Keyboard event received from the window.
   */
  handlePlayingKeyDown(event) {
    if (event.key === "ArrowLeft") this.world.keyboard.left = true;
    if (event.key === "ArrowRight") this.world.keyboard.right = true;
    if (event.key === "ArrowUp") this.world.keyboard.jump = true;
    if (event.code === "Space") {
      event.preventDefault();
      this.world.keyboard.throw = true;
    }
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
    this.updateGameplayKey(event, false);
  }

  /** Sets or clears a gameplay control for a keyboard event.
   * @param {KeyboardEvent} event Keyboard event received from the window.
   * @param {boolean} pressed Whether the control should be active.
   */
  updateGameplayKey(event, pressed) {
    if (event.key === "ArrowLeft") this.world.keyboard.left = pressed;
    if (event.key === "ArrowRight") this.world.keyboard.right = pressed;
    if (event.key === "ArrowUp") this.world.keyboard.jump = pressed;
    if (event.code === "Space") this.world.keyboard.throw = pressed;
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
    this.world.resetActorsToGround();

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
    this.gameSong.play().catch(() => {
      // Playback can still be blocked when startGameSong is called outside a user gesture.
    });
  }

  /**
   * Transitions active gameplay to the victory state.
   *
   * @returns {void}
   */
  winGame() {
    if (this.state !== "playing") return;

    this.state = "gameWon";
    this.world.resetActorsToGround();

    this.gameSong.pause();
    this.gameSong.currentTime = 0;

    this.endOfGameSong.currentTime = 0;
    this.endOfGameSong.play();

    this.victoryScene = new VictoryScene(this.world);
  }

  /** Stops active gameplay and recreates the intro scene. */
  returnToIntro() {
    this.world?.stop();

    [this.gameSong, this.funeralSong, this.endOfGameSong].forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });

    this.display.setGameplayUiVisible(false);

    this.world = null;
    this.endScreen = null;
    this.victoryScene = null;

    this.intro = new IntroScene(this.canvas);
    this.state = "intro";

    this.start();
  }

  /** Handles Enter and scrolling-speed input while the intro is active.
   * @param {KeyboardEvent} event Keyboard event received from the window.
   */
  handleIntroInput(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.playTitleSong();
      this.startWorld();
      return;
    }

    if (event.key === "ArrowRight") {
      this.intro.scrollingText.changeSpeed(20);
    }

    if (event.key === "ArrowLeft") {
      this.intro.scrollingText.changeSpeed(-20);
    }
  }
}
