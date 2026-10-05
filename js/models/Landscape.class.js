/** Defines the tile dimensions and parallax layers of a level landscape. */
class Landscape {
  /** @type {number} Width of each repeated landscape tile. */
  tileWidth = 865;

  /** @type {number} Number of tiles created for every landscape layer. */
  tileCount = 5;

  /** @type {number} Horizontal world limit derived from the tiled scenery. */
  levelLength = 100 + this.tileCount * this.tileWidth;

  /** @type {BackgroundObject[]} Layered parallax background tiles. */
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
  /** @type {Grass[]} Foreground ground tiles. */
  grass = createTiles(
    Grass,
    this.tileCount,
    this.tileWidth,
    "/img/landscape/Ground.png",
    1.9,
  );
}
