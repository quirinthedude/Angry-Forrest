window.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    Keyboard.left = true;
  } else if (event.key === "ArrowRight") {
    Keyboard.right = true;
  }
});

window.addEventListener("keyup", function (event) {
  if (event.key === "ArrowLeft") {
    Keyboard.left = false;
  } else if (event.key === "ArrowRight") {
    Keyboard.right = false;
  }
});
