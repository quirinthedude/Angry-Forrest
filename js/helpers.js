/**
 *
 * @param {string} path path to the images
 * @param {number} amount number of images to generate
 * @returns {string} array with names of images from path
 */
function createAnimationImages(path, amount) {
  return Array.from(
    { length: amount },
    (_, i) => `${path}${String(i)}.padStart(3, "0")}.png`,
  );
}
