let canvas;
let game;

function init() {
  const preIntro = document.getElementById("pre-intro");
  const startButton = document.getElementById("pre-intro-start");
  const canvasElement = document.getElementById("canvas");
  const display = new DisplayController();

  bindTouchControls();
  bindOptionControls();
  bindGameSurfaceProtection();
  bindCanvasTap();

  startButton.addEventListener("click", () => {
    if (game || !display.isLandscape()) return;

    preIntro.hidden = true;
    display.updateOrientationPrompt();

    canvas = canvasElement;
    game = new Game(canvas, display);
    window.game = game;

    display.updateMuteUI(game.isMuted);
    game.start();
    game.display.prepareLandscapeMode();
  });
}
