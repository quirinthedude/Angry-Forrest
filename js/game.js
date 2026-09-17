let canvas;
let game;

function init() {
  const preIntro = document.getElementById("pre-intro");
  const canvasElement = document.getElementById("canvas");
  const display = new DisplayController();

  bindTouchControls();
  bindOptionControls();
  bindGameSurfaceProtection();
  bindCanvasTap();

  preIntro.addEventListener(
    "click",
    (event) => {
      if (event.target.closest("a")) return;

      if (!display.isLandscape()) return;

      preIntro.hidden = true;
      display.updateOrientationPrompt();

      canvas = canvasElement;
      game = new Game(canvas, display);
      window.game = game;
      game.start();
      game.display.prepareLandscapeMode();
    },
    { once: true },
  );
}
