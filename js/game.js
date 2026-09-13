let canvas;
let game;

function init() {
  const preIntro = document.getElementById("pre-intro");
  const canvasElement = document.getElementById("canvas");
  const orientationPrompt = document.getElementById("orientation-prompt");

  const updatePreIntroOrientation = () => {
    orientationPrompt.hidden = window.matchMedia(
      "(orientation: landscape)",
    ).matches;
  };

  bindTouchControls();
  bindOptionControls();
  updatePreIntroOrientation();
  window.addEventListener("resize", updatePreIntroOrientation);
  window.addEventListener("orientationchange", updatePreIntroOrientation);

  const startWorldFromIntro = () => {
    if (window.game?.state !== "intro") return;
    window.game.startWorld();
  };

  canvasElement.addEventListener("pointerup", startWorldFromIntro);
  canvasElement.addEventListener("click", startWorldFromIntro);

  preIntro.addEventListener(
    "click",
    () => {
      if (!window.matchMedia("(orientation: landscape)").matches) return;

      preIntro.hidden = true;
      orientationPrompt.hidden = true;

      canvas = canvasElement;
      game = new Game(canvas);
      window.game = game;
      game.start();
      game.prepareLandscapeMode();
    },
    { once: true },
  );
}
