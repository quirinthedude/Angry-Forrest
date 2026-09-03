class Landscape {
  tileWidth = 865;
  tileCount = 5;
  levelLength = 100 + this.tileCount * this.tileWidth;
  backgroundobject = [
    ...createTiles(
      BackgroundObject,
      this.tileCount,
      this.tileWidth,
      "/img/landscape/BG_Decor.png",
      0.65,
    ),
    ...createTiles(
      BackgroundObject,
      this.tileCount,
      this.tileWidth,
      "/img/landscape/Middle_Decor.png",
      0.8,
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
}
