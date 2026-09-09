/**
 * Base class for all drawable game objects.
 *
 * Stores position, dimensions and the currently displayed image.
 * It also tracks image loading so the game can wait until all required
 * assets are available before rendering starts.
 */
class DrawableObject {
  x;
  y;
  width;
  height;
  img;
  imagePromises = [];

  /**
   * Loads an image and assigns it as the currently displayed image.
   *
   * The loading process is registered before the image source is set,
   * allowing the game to wait for the asset later.
   *
   * @param {string} path Path to the image asset.
   * @returns {void}
   */
  loadImage(path) {
    this.img = new Image();
    this.trackImage(this.img, path);
    this.img.src = path;
  }

  /**
   * Registers the loading state of an image.
   *
   * The created promise resolves when the image has loaded and rejects
   * if loading the asset fails.
   *
   * @param {HTMLImageElement} image Image element to track.
   * @param {string} path Path used for the error message if loading fails.
   * @returns {void}
   */
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

  /**
   * Waits until all images registered by this object have finished loading.
   *
   * @returns {Promise<Event[]>} Promise that resolves when all tracked images
   * are loaded.
   */
  waitForImages() {
    return Promise.all(this.imagePromises);
  }

  /**
   * Determines whether the object should be mirrored horizontally.
   *
   * Child classes can override this method when their orientation depends
   * on their movement direction.
   *
   * @returns {boolean} True if the object should be mirrored.
   */
  shouldMirror() {
    return false; // default value, can be overridden in child classes
  }
}
