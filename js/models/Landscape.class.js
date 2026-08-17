class Landscape {
  backgroundobject = [
    new BackgroundObject("/img/landscape/BG_Decor.png", 0.8, 0),
    new BackgroundObject("/img/landscape/BG_Decor.png", 0.8, 866),
    new BackgroundObject("./img/landscape/Middle_Decor.png", 1.4, 0),
    new BackgroundObject("./img/landscape/Middle_Decor.png", 1.4, 866),
    new BackgroundObject("./img/landscape/Foreground.png", 1.8, 0),
    new BackgroundObject("./img/landscape/Foreground.png", 1.8, 866),
  ];
  grass = [new Grass(1.9, 0), new Grass(1.9, 720)];

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
