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

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    //  this.character.img.onload = () => this.draw();
    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawObject(this.character);
    this.enemies.forEach((enemy) => {
      this.drawObject(enemy);
    });
    requestAnimationFrame(() => this.draw());
    // Alternative Schreibweise:
    // let self = this;
    // requestAnimationFrame(function() { self.draw() });
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
}
