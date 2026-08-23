window.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    world.keyboard.left = true;
  } else if (event.key === "ArrowRight") {
    world.keyboard.right = true;
  } else if (event.key === "ArrowUp") {
    world.keyboard.jump = true;
  }
});

window.addEventListener("keyup", function (event) {
  if (event.key === "ArrowLeft") {
    world.keyboard.left = false;
  } else if (event.key === "ArrowRight") {
    world.keyboard.right = false;
  } else if (event.key === "ArrowUp") {
    world.keyboard.jump = false;
  }
});
