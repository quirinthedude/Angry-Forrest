class DrawableObject {
  x;
  y;
  width;
  height;
  img;
  imagePromises = [];

  loadImage(path) {
    this.img = new Image();
    this.trackImage(this.img, path);
    this.img.src = path;
  }

  trackImage(image, path) {
    const promise = new Promise((resolve, reject) => {
      image.addEventListener("load", resolve, { once: true });

      image.addEventListener(
        "error",
        () => reject(new Error(`Could not load image: ${path}`)),
        { once: true },
      );
    });

    this.imagePromises.push(promise);
  }

  waitForImages() {
    return Promise.all(this.imagePromises);
  }

  shouldMirror() {
    return false; // default value, can be overridden in child classes
  }
}
