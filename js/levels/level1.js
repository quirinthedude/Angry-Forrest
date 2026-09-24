/** Creates the enemies, collectibles and scenery used by the first level.
 * @param {World} world World instance shared by the level actors.
 * @returns {Level} Configured level data.
 */
function createLevel1(world) {
  return new Level(
    [
      new Gnome(Math.random() * 300 + 400, 360, 200, 520, world),
      new Gnome(Math.random() * 300 + 500, 360, 500, 850, world),
      new Gnome(Math.random() * 300 + 1200, 360, 1000, 1500, world),
      new MiniRobot(1700, 360, 1600, 2100, world),
      new MiniRobot(2800, 360, 2000, 2800, world),
      new Robot(1300, 292, world), //2300
    ],
    [
      new Fruit(Math.random() * 300 + 500, 80),
      new Fruit(Math.random() * 300 + 900, 100),
      new Fruit(Math.random() * 300 + 1500, 90),
      new Fruit(Math.random() * 300 + 2100, 80),
      new Fruit(Math.random() * 300 + 3000, 80),
      new Fruit(Math.random() * 300 + 3300, 60),
    ],
    new Sky(),
    new Landscape(),
  );
}
