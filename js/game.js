let canvas;
let world;
let game;

function init() {
  canvas = document.getElementById("canvas");
  game = new Game(canvas);
  window.game = game;
  game.start();
}
