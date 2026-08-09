class World {
  character = new Character();
  enemies = [
    new Golem(Math.random() * 300 + 200, 360),
    new Golem(Math.random() * 300 + 200, 360),
    new Golem(Math.random() * 300 + 200, 360),
    new Robot(520, 310),
  ];
  ctx;
  canvas;
  sky = new Sky();
  robot = new Robot();
  grass = new Grass();
  backgroundobject = [
    new BackgroundObject("./img/landscape/Middle_Decor.png"),
    new BackgroundObject("./img/landscape/Foreground.png"),
  ];

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawObject(this.sky);
    this.drawObjects(this.backgroundobject);
    this.drawObject(this.character);
    this.drawObjects(this.enemies);
    this.drawObject(this.grass);
    requestAnimationFrame(() => this.draw());
  }

  drawObject(object) {
    if (object.mirrorX) {
      this.drawMirroredObject(object);
    } else {
      this.ctx.drawImage(
        object.img,
        object.x,
        object.y,
        object.width,
        object.height,
      );
    }
  }

  drawMirroredObject(object) {
    this.ctx.save();
    this.ctx.translate(object.x + object.width, object.y);
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(object.img, 0, 0, object.width, object.height);
    this.ctx.restore();
  }

  drawObjects(object) {
    object.forEach((obj) => {
      this.drawObject(obj);
    });
  }
}
