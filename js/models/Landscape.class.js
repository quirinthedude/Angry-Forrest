class Landscape {
  tileWidth = 865;
  tileCount = 5;
  levelLength = this.tileCount * this.tileWidth;
  backgroundobject = [
    ...createTiles(
      BackgroundObject,
      this.tileCount,
      this.tileWidth,
      "/img/landscape/BG_Decor.png",
      0.8,
    ),
    ...createTiles(
      BackgroundObject,
      this.tileCount,
      this.tileWidth,
      "/img/landscape/Middle_Decor.png",
      1.4,
    ),
    ...createTiles(
      BackgroundObject,
      this.tileCount,
      this.tileWidth,
      "/img/landscape/Foreground.png",
      1.8,
    ),
  ];
  grass = createTiles(
    Grass,
    this.tileCount,
    this.tileWidth,
    "/img/landscape/Ground.png",
    1.9,
  );

  scroll(direction) {
    this.backgroundobject.forEach((object) => {
      this.scrollParallax(object, direction);
    });

    this.grass.forEach((object) => {
      this.scrollParallax(object, direction);
    });
  }

  scrollParallax(object, direction) {
    object.x += object.speed * direction;

    if (
      (direction === -1 && object.x <= -object.width) ||
      (direction === 1 && object.x >= object.width)
    ) {
      object.x -= object.width * 2 * direction;
    }
  }
}
