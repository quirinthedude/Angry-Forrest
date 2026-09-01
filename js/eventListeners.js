window.addEventListener("keydown", function (event) {
  if (game) game.handleKeyDown(event);
});

window.addEventListener("keyup", function (event) {
  if (game) game.handleKeyUp(event);
});
