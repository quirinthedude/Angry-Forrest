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

/**
 *
 * @param {Function} TileClass class used to create the tiles
 * @param {Number} count counts tiles attached together
 * @param {Number} tileWidth tile width of the parallax-element
 * @returns {Array} Array containing the generated parallax-element
 *
 * Generates multiple landscape tiles and positions them next to each other.
 *
 */
function createTiles(TileClass, count, tileWidth) {
  const tiles = [];

  for (let i = 0; i < count; i++) {
    tiles.push(new tileClass(i * tileWidth));
  }
  return tiles;
}
