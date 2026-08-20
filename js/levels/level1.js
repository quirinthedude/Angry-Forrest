const level1 = new Level(
  [
    new Golem(Math.random() * 300 + 200, 360),
    new Golem(Math.random() * 300 + 200, 360),
    new Golem(Math.random() * 300 + 200, 360),
    new Robot(2300, 360),
  ],
  new Sky(),
  new Landscape(),
);
