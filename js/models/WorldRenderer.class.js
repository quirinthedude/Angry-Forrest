/**
 * Renders the world layers and drawable objects for a {@link World}.
 *
 * The renderer composes with World and reads its current state for every
 * frame, so camera movement and debug settings remain immediately visible.
 */
class WorldRenderer {
  /**
   * Creates a renderer for an existing world.
   *
   * @param {World} world World whose state and canvas are rendered.
   */
  constructor(world) {
    this.world = world;
  }

  /** Clears the canvas and renders all three world layers in order. */
  renderWorld() {
    const { canvas, ctx } = this.world;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.drawBackground();
    this.drawActors();
    this.drawForeground();
  }

  /** Draws the sky and distant background layers. */
  drawBackground() {
    const { level } = this.world;
    this.drawObject(level.sky);
    this.drawParallaxObjects(level.landscape.backgroundobject);
  }

  /** Draws camera-translated actors and active projectiles. */
  drawActors() {
    const { ctx, level, character, thrownFruits, bombs } = this.world;
    ctx.save();
    ctx.translate(this.world.cameraX, 0);
    this.drawObjects(level.enemies);
    this.drawObject(character);
    this.drawObjects(thrownFruits.filter((fruit) => fruit.state !== "landed"));
    this.drawObjects(bombs);
    ctx.restore();
  }

  /** Draws foreground parallax layers that appear above the actors. */
  drawForeground() {
    const { level, thrownFruits } = this.world;
    this.drawParallaxObjects(level.fruits);
    this.drawParallaxObjects(
      thrownFruits.filter((fruit) => fruit.state === "landed"),
    );
    this.drawParallaxObjects(level.landscape.grass);
  }

  /**
   * Draws one renderable object with hurt blinking, mirroring and debugging.
   *
   * @param {DrawableObject} object Object to render.
   */
  drawObject(object) {
    if (this.shouldSkipObject(object)) return;
    object.shouldMirror()
      ? this.drawMirroredObject(object)
      : this.drawRegularObject(object);
    if (this.world.collisionDebug) this.drawCollisionDebug(object);
  }

  /**
   * Determines whether an object is not ready or should blink invisible.
   *
   * @param {DrawableObject} object Object considered for rendering.
   * @returns {boolean} Whether drawing should be skipped.
   */
  shouldSkipObject(object) {
    if (!object.img || !object.img.complete || object.img.naturalWidth === 0) {
      return true;
    }
    return (
      object.isHurt && object.isHurt() && Math.floor(Date.now() / 100) % 2 === 0
    );
  }

  /**
   * Draws an object without applying horizontal mirroring.
   *
   * @param {DrawableObject} object Object to render.
   */
  drawRegularObject(object) {
    const { ctx } = this.world;
    ctx.drawImage(object.img, object.x, object.y, object.width, object.height);
  }

  /**
   * Draws the outer and collision-adjusted bounds of an object.
   *
   * @param {DrawableObject} object Object whose bounds should be visualized.
   */
  drawCollisionDebug(object) {
    this.drawDebugBounds(object, this.getCollisionDebugOffsets(object));
  }

  /**
   * Resolves the collision offsets used by the debug overlay.
   *
   * @param {DrawableObject} object Object whose offsets should be resolved.
   * @returns {{left: number, right: number, top: number, bottom: number}} Effective collision offsets.
   */
  getCollisionDebugOffsets(object) {
    return object.getCollisionOffsets
      ? object.getCollisionOffsets()
      : {
          left: object.leftOffset ?? 0,
          right: object.rightOffset ?? 0,
          top: object.topOffset ?? 0,
          bottom: object.bottomOffset ?? 0,
        };
  }

  /**
   * Draws the outer and collision-adjusted rectangles for an object.
   *
   * @param {DrawableObject} object Object whose bounds should be drawn.
   * @param {{left: number, right: number, top: number, bottom: number}} offsets Effective collision offsets.
   */
  drawDebugBounds(object, offsets) {
    const { ctx } = this.world;
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeRect(object.x, object.y, object.width, object.height);
    ctx.beginPath();
    ctx.strokeRect(
      object.x + offsets.left,
      object.y + offsets.top,
      object.width - offsets.right - offsets.left,
      object.height - offsets.top - offsets.bottom,
    );
    ctx.lineWidth = 1;
  }

  /**
   * Draws an object mirrored horizontally at its world position.
   *
   * @param {DrawableObject} object Object to render in mirrored orientation.
   */
  drawMirroredObject(object) {
    const { ctx } = this.world;
    ctx.save();
    ctx.translate(object.x + object.width, object.y);
    ctx.scale(-1, 1);
    ctx.drawImage(object.img, 0, 0, object.width, object.height);
    ctx.restore();
  }

  /**
   * Draws each object in a collection.
   *
   * @param {DrawableObject[]} objects Objects to render.
   */
  drawObjects(objects) {
    objects.forEach((object) => this.drawObject(object));
  }

  /**
   * Draws objects using their individual parallax factors and the camera.
   *
   * @param {Array<DrawableObject & {parallaxFactor: number}>} objects Objects to render.
   */
  drawParallaxObjects(objects) {
    const { ctx } = this.world;
    objects.forEach((object) => {
      ctx.save();
      ctx.translate(this.world.cameraX * object.parallaxFactor, 0);
      this.drawObject(object);
      ctx.restore();
    });
  }
}
