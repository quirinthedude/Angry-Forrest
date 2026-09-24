/** Creates the numbered image paths used by a sprite animation.
 * @param {string} path Path prefix up to (and including) the underscore before the frame number.
 * @param {number} amount Number of frame paths to generate.
 * @returns {string[]} Array containing the generated image paths.
 */
function createAnimationImages(path, amount) {
  return Array.from(
    { length: amount },
    (_, i) => `${path}${String(i).padStart(3, "0")}.png`,
  );
}

/** Creates and positions a row of parallax tiles.
 * @param {Function} TileClass class used to create the tiles
 * @param {number} count Number of tiles to create.
 * @param {number} tileWidth Width used to position each successive tile.
 * @param {string} path Image path passed to each tile constructor.
 * @param {number} speed Parallax factor passed to each tile constructor.
 * @returns {Array} The generated tile instances.
 */
function createTiles(TileClass, count, tileWidth, path, speed) {
  const tiles = [];

  for (let i = 0; i < count; i++) {
    tiles.push(new TileClass(path, speed, i * tileWidth));
  }
  return tiles;
}
