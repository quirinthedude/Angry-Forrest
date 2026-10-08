/**
 * Creates the enemies, collectibles and scenery used by the first level.
 *
 * @param {World} world World instance shared by the level actors.
 * @returns {Level} Configured level data.
 */
function createLevel1(world) {
  const enemies = createLevel1Enemies(world);
  const fruits = createLevel1Fruits();
  const sky = new Sky();
  const landscape = new Landscape();

  return new Level(enemies, fruits, sky, landscape);
}

/**
 * Creates the enemies in their configured level order.
 *
 * @param {World} world World instance shared by the enemies.
 * @returns {(Gnome|MiniRobot|Robot)[]} Level-one enemies.
 */
function createLevel1Enemies(world) {
  return [
    new Gnome(Math.random() * 300 + 400, 360, 200, 520, world),
    new Gnome(Math.random() * 300 + 500, 360, 500, 850, world),
    new Gnome(Math.random() * 300 + 1200, 360, 1000, 1500, world),
    new MiniRobot(1700, 360, 1600, 2100, world),
    new MiniRobot(2800, 360, 1600, 2800, world),
    new MiniRobot(2300, 360, 1200, 2800, world),
    new Robot(3900, 292, world),
  ];
}

/**
 * Creates the collectible fruits in their configured level order.
 *
 * @returns {Fruit[]} Level-one collectibles.
 */
function createLevel1Fruits() {
  return [
    new Fruit(Math.random() * 300 + 500, 80),
    new Fruit(Math.random() * 300 + 900, 100),
    new Fruit(Math.random() * 300 + 1500, 90),
    new Fruit(Math.random() * 300 + 2100, 80),
    new Fruit(Math.random() * 300 + 3000, 80),
    new Fruit(Math.random() * 300 + 2300, 60),
  ];
}
