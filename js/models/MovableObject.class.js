class MovableObject extends DrawableObject {
  x;
  y;
  img;
  mirrorX = false;
  imageCache = {};

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }
  /**
   *
   * @param {Array} arr - ['img/character/walk/6_animation_walk_000.png', 'img/character/walk/6_animation_walk_001.png', ...]
   */
  loadImages(arr) {
    arr.forEach((path) => {
      const img = new Image();
      img.src = path;
      this.imageCache[path] = img;
    });
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
