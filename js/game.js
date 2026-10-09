/** @type {HTMLCanvasElement|undefined} Canvas used by the active game. */
let canvas;

/** @type {Game|undefined} Active game lifecycle controller. */
let game;

/** Initializes the intro UI, input bindings and game start controls. */
function init() {
  const preIntro = document.getElementById("pre-intro");
  const howToPlay = document.getElementById("how-to-play");
  const howToPlayButton = document.getElementById("how-to-play-button");
  const howToPlayBackButton = document.getElementById("how-to-play-back");
  const preIntroMainElements = getPreIntroMainElements(preIntro);
  const startButton = document.getElementById("pre-intro-start");
  const canvasElement = document.getElementById("canvas");
  const display = new DisplayController();

  bindGameInterfaceControls();
  bindHowToPlayControls(howToPlayButton, howToPlayBackButton, preIntroMainElements, howToPlay);
  bindGameStartControl(startButton, preIntro, canvasElement, display);
}

/**
 * Collects the intro elements hidden while the instructions are visible.
 *
 * @param {HTMLElement} preIntro Intro container holding the primary content.
 * @returns {HTMLElement[]} Primary intro elements in their existing DOM order.
 */
function getPreIntroMainElements(preIntro) {
  return [
    preIntro.querySelector(":scope > h1"),
    preIntro.querySelector(":scope > img"),
    preIntro.querySelector(":scope > .pre-intro-actions"),
  ];
}

/** Registers the existing gameplay, option, protection and canvas controls. */
function bindGameInterfaceControls() {
  bindTouchControls();
  bindOptionControls();
  bindGameSurfaceProtection();
  bindCanvasTap();
}

/**
 * Connects the instruction buttons to the intro visibility state.
 *
 * @param {HTMLElement} showButton Button that opens the instructions.
 * @param {HTMLElement} backButton Button that returns to the intro actions.
 * @param {HTMLElement[]} mainElements Intro elements hidden by the instructions.
 * @param {HTMLElement} howToPlay Instructions panel whose visibility is toggled.
 */
function bindHowToPlayControls(
  showButton,
  backButton,
  mainElements,
  howToPlay,
) {
  showButton.addEventListener("click", () =>
    setHowToPlayVisible(mainElements, howToPlay, true),
  );
  backButton.addEventListener("click", () =>
    setHowToPlayVisible(mainElements, howToPlay, false),
  );
}

/**
 * Shows either the intro actions or the how-to-play panel.
 *
 * @param {HTMLElement[]} mainElements Intro elements hidden by the instructions.
 * @param {HTMLElement} howToPlay Instructions panel whose visibility is toggled.
 * @param {boolean} visible Whether the how-to-play panel should be visible.
 */
function setHowToPlayVisible(mainElements, howToPlay, visible) {
  mainElements.forEach((element) => {
    element.hidden = visible;
  });
  howToPlay.hidden = !visible;
}

/**
 * Connects the start button to the captured intro and display instances.
 *
 * @param {HTMLElement} startButton Button that starts the game.
 * @param {HTMLElement} preIntro Intro overlay hidden when the game starts.
 * @param {HTMLCanvasElement} canvasElement Canvas assigned to the active game.
 * @param {DisplayController} display Shared display controller for this session.
 */
function bindGameStartControl(
  startButton,
  preIntro,
  canvasElement,
  display,
) {
  startButton.addEventListener("click", () =>
    startGame(preIntro, canvasElement, display),
  );
}

/**
 * Creates and starts the game when the current display state permits it.
 *
 * @param {HTMLElement} preIntro Intro overlay hidden when the game starts.
 * @param {HTMLCanvasElement} canvasElement Canvas assigned to the active game.
 * @param {DisplayController} display Shared display controller for this session.
 */
function startGame(preIntro, canvasElement, display) {
  if (game || display.requiresLandscape()) return;

  preIntro.hidden = true;
  display.updateOrientationPrompt();

  canvas = canvasElement;
  game = new Game(canvas, display);
  window.game = game;

  game.start();
  game.display.prepareLandscapeMode();
}
