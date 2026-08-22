function createLevel1(world) {
  return new Level(
    [
      new Golem(Math.random() * 300 + 200, 360, world),
      new Golem(Math.random() * 300 + 200, 360, world),
      new Golem(Math.random() * 300 + 200, 360, world),
      new Robot(1300, 292, world), //2300
    ],
    new Sky(),
    new Landscape(),
  );
}
