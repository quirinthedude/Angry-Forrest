/**
 * Base class for all drawable game objects.
 *
 * A drawable object manages its position, dimensions and currently displayed
 * image. It also collects image-loading promises so {@link World} can wait
 * for all required assets before rendering starts.
 */
class DrawableObject {
  x;
  y;
  width;
  height;
  img;

  /**
   * Image-loading promises collected for this object.
   *
   * Each promise settles when one tracked image has loaded or failed. The
   * collection allows {@link World} to wait for all assets used by the game.
   *
   * @type {Promise<Event>[]}
   */
  imagePromises = [];

  /**
   * Loads an image and assigns it as the currently displayed image.
   *
   * The image-loading process is registered before the image source is set so
   * the asset can be included when {@link World} waits for required images.
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
   * The created promise resolves when the image has loaded and rejects if
   * loading the asset fails. The promise is added to {@link imagePromises} so
   * it can later be included in the collective wait operation.
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
   * {@link World} uses this method to wait for every drawable object's
   * collected assets before marking the world as ready.
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
   * The base implementation returns `false`. Child classes can override this
   * method when their orientation depends on their movement direction.
   *
   * @returns {boolean} True if the object should be mirrored.
   */
  shouldMirror() {
    return false;
  }
}
