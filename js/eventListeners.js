window.addEventListener("keydown", function (event) {
  if (event.key === "ArrowLeft") {
    world.keyboard.left = true;
  } else if (event.key === "ArrowRight") {
    world.keyboard.right = true;
  }
  console.log("keydown");
  console.log("left: ", world.keyboard.left);
  console.log("right: ", world.keyboard.right);
});

window.addEventListener("keyup", function (event) {
  if (event.key === "ArrowLeft") {
    world.keyboard.left = false;
  } else if (event.key === "ArrowRight") {
    world.keyboard.right = false;
  }
  console.log("keydup");
  console.log("left: ", world.keyboard.left);
  console.log("right: ", world.keyboard.right);
});
