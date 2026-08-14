/**
 *
 * @param {string} path Path prefix up to (and including) the underscore before the frame number.
 * @param {number} amount number of images to generate
 * @returns {string[]} Array containing the generated image paths.
 */
function createAnimationImages(path, amount) {
  return Array.from(
    { length: amount },
    (_, i) => `${path}${String(i).padStart(3, "0")}.png`,
  );
}
