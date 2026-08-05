class MovableObject {
  x;
  y;
  img;
  mirrorX = false;

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }
  moveRight() {
    console.log("Moving right");
    this.x += 5; // Move the character to the right by 5 pixels
  }
  moveLeft() {
    console.log("Moving left");
    this.x -= 5; // Move the character to the left by 5 pixels
  }
  jump() {
    console.log("Jumping");
    this.y -= 10; // Move the character up by 10 pixels
  }
}
