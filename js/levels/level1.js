function createLevel1(world) {
  return new Level(
    [
      new Gnome(Math.random() * 300 + 200, 360, world),
      new Gnome(Math.random() * 300 + 500, 360, world),
      new Gnome(Math.random() * 300 + 1200, 360, world),
      new Robot(1300, 292, world), //2300
    ],
    new Sky(),
    new Landscape(),
  );
}
