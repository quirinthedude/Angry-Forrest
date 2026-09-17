let canvas;
let game;

function init() {
  const preIntro = document.getElementById("pre-intro");
  const canvasElement = document.getElementById("canvas");
  const display = new DisplayController();

  bindTouchControls();
  bindOptionControls();
  bindGameSurfaceProtection();
  bindEndScreenTap();

  const startWorldFromIntro = () => {
    if (window.game?.state !== "intro") return;
    window.game.startWorld();
  };

  canvasElement.addEventListener("pointerup", startWorldFromIntro);
  canvasElement.addEventListener("click", startWorldFromIntro);

  preIntro.addEventListener(
    "click",
    () => {
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
