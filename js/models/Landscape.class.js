class Landscape {
  backgroundobject = [
    new BackgroundObject("/img/landscape/BG_Decor.png", 0.15, 0),
    new BackgroundObject("/img/landscape/BG_Decor.png", 0.15, 866),
    new BackgroundObject("./img/landscape/Middle_Decor.png", 0.3, 0),
    new BackgroundObject("./img/landscape/Middle_Decor.png", 0.3, 866),
    new BackgroundObject("./img/landscape/Foreground.png", 0.8, 0),
    new BackgroundObject("./img/landscape/Foreground.png", 0.8, 866),
  ];
  grass = [new Grass(1.25, 0), new Grass(1.25, 720)];

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
