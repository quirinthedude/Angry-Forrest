let canvas;
let game;

function init() {
  const preIntro = document.getElementById("pre-intro");
  preIntro.addEventListener(
    "click",
    () => {
      preIntro.hidden = true;

      canvas = document.getElementById("canvas");
      game = new Game(canvas);
      window.game = game;
      game.start();
    },
    { once: true },
  );
}
