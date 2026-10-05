/** Groups all actors and scenery belonging to one playable level. */
class Level {
  /** @type {(Gnome|MiniRobot|Robot)[]} Enemies placed in the level. */
  enemies;

  /** @type {Fruit[]} Collectibles placed in the level. */
  fruits;

  /** @type {Sky} Background sky object. */
  sky;

  /** @type {Landscape} Scrolling landscape layers. */
  landscape;

  /** Creates level data from its actor and scenery collections.
   * @param {(Gnome|MiniRobot|Robot)[]} enemies Enemies placed in the level.
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
