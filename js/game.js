let canvas;
let game;

function init() {
  const preIntro = document.getElementById("pre-intro");
  const howToPlay = document.getElementById("how-to-play");
  const howToPlayButton = document.getElementById("how-to-play-button");
  const howToPlayBackButton = document.getElementById("how-to-play-back");
  const preIntroMainElements = [
    preIntro.querySelector(":scope > h1"),
    preIntro.querySelector(":scope > img"),
    preIntro.querySelector(":scope > .pre-intro-actions"),
  ];
  const startButton = document.getElementById("pre-intro-start");
  const canvasElement = document.getElementById("canvas");
  const display = new DisplayController();

  function setHowToPlayVisible(visible) {
    preIntroMainElements.forEach((element) => {
      element.hidden = visible;
    });
    howToPlay.hidden = !visible;
  }

  bindTouchControls();
  bindOptionControls();
  bindGameSurfaceProtection();
  bindCanvasTap();

  howToPlayButton.addEventListener("click", () => setHowToPlayVisible(true));
  howToPlayBackButton.addEventListener("click", () =>
    setHowToPlayVisible(false),
  );

  startButton.addEventListener("click", () => {
    if (game || !display.isLandscape()) return;

    preIntro.hidden = true;
    display.updateOrientationPrompt();

    canvas = canvasElement;
    game = new Game(canvas, display);
    window.game = game;

    game.start();
    game.display.prepareLandscapeMode();
  });
}
