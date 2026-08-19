class World {
  character;
  keyboard = new Keyboard();
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
  landscape = new Landscape();
  cameraX = 0;
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.character = new Character(this);

    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawObject(this.sky);
    this.drawParallaxObjects(this.landscape.backgroundobject);

    this.ctx.save();
    this.ctx.translate(this.cameraX, 0);

    this.drawObject(this.character);
    this.drawObjects(this.enemies);

    this.ctx.restore();

    this.drawParallaxObjects(this.landscape.grass);

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

  drawParallaxObjects(objects) {
    objects.forEach((object) => {
      this.ctx.save();
      this.ctx.translate(this.cameraX * object.speed, 0);
      this.drawObject(object);
      this.ctx.restore();
    });
  }
}
