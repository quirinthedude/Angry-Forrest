window.addEventListener("keydown", function (event) {
  if (window.game) this.window.game.handleKeyDown(event);
});

window.addEventListener("keyup", function (event) {
  if (window.game) window.game.handleKeyUp(event);
});
