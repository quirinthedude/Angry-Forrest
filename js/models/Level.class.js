/** Groups all actors and scenery belonging to one playable level. */
class Level {
  enemies;
  fruits;
  sky;
  landscape;

  /** Creates level data from its actor and scenery collections.
   * @param {MovableObject[]} enemies Enemies placed in the level.
   * @param {Fruit[]} fruits Collectibles placed in the level.
   * @param {Sky} sky Background sky object.
   * @param {Landscape} landscape Scrolling landscape layers.
   */
  constructor(enemies, fruits, sky, landscape) {
    this.enemies = enemies;
    this.fruits = fruits;
    this.sky = sky;
    this.landscape = landscape;
  }
}
