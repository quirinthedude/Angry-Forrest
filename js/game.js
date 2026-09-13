let canvas;
let game;

function init() {
  const preIntro = document.getElementById("pre-intro");
  const canvasElement = document.getElementById("canvas");

  bindTouchControls();
  bindOptionControls();

  const startWorldFromIntro = () => {
    if (window.game?.state !== "intro") return;
    window.game.startWorld();
  };

  canvasElement.addEventListener("pointerup", startWorldFromIntro);
  canvasElement.addEventListener("click", startWorldFromIntro);

  preIntro.addEventListener(
    "click",
    () => {
      preIntro.hidden = true;

      canvas = canvasElement;
      game = new Game(canvas);
      window.game = game;
      game.start();
    },
    { once: true },
  );
}
