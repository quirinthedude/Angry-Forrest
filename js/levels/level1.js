function createLevel1(world) {
  return new Level(
    [
      new Golem(Math.random() * 300 + 200, 360, world),
      new Golem(Math.random() * 300 + 200, 360, world),
      new Golem(Math.random() * 300 + 200, 360, world),
      new Robot(2300, 360, world),
    ],
    new Sky(),
    new Landscape(),
  );
}
