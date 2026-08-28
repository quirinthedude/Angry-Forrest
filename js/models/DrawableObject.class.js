class DrawableObject {
  x;
  y;
  width;
  height;
  img;

  loadImage(path) {
    this.img = new Image();
    this.img.src = path;
  }

  shouldMirror() {
    return false; // default value, can be overridden in child classes
  }
}
