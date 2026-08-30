class World {
  character;
  keyboard = new Keyboard();
  level;
  ctx;
  canvas;
  cameraX = 0;
  // needs to be removed in time
  collisionDebug = false;
  //

  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");

    this.level = createLevel1(this);
    this.character = new Character(this);

    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawObject(this.level.sky);
    this.drawParallaxObjects(this.level.landscape.backgroundobject);

    this.ctx.save();
    this.ctx.translate(this.cameraX, 0);

    this.drawObject(this.character);
    this.drawObjects(this.level.enemies);

    this.ctx.restore();

    this.drawParallaxObjects(this.level.landscape.grass);

    requestAnimationFrame(() => this.draw());
  }

  drawObject(object) {
    if (
      object.isHurt &&
      object.isHurt() &&
      Math.floor(Date.now() / 100) % 2 === 0
    )
      return;
    if (object.shouldMirror()) {
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
    if (object.collisionDebug) {
      const offsets = object.getCollisionOffsets
        ? object.getCollisionOffsets()
        : {
            left: object.leftOffset,
            right: object.rightOffset,
          };
      this.ctx.beginPath();
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(object.x, object.y, object.width, object.height);
      this.ctx.beginPath();
      this.ctx.strokeRect(
        object.x + offsets.left,
        object.y + offsets.top,
        object.width - offsets.right - offsets.left,
        object.height - offsets.top - offsets.bottom,
      );
      this.ctx.lineWidth = 1;
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
      this.ctx.translate(this.cameraX * object.parallaxFactor, 0);
      this.drawObject(object);
      this.ctx.restore();
    });
  }
}
