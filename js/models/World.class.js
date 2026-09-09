/**
 * Coordinates the active game world and its rendering lifecycle.
 *
 * World connects the canvas, camera, character, level, thrown fruits,
 * collision checks, game-over rendering and the asset-loading boundary used
 * before gameplay starts.
 */
class World {
  /** @type {Character} Player character controlled within this world. */
  character;

  /** @type {Keyboard} Shared gameplay input state. */
  keyboard = new Keyboard();

  /** @type {Level} Level containing enemies, fruits and landscape objects. */
  level;

  /** @type {CanvasRenderingContext2D} Context used for all world rendering. */
  ctx;

  /** @type {HTMLCanvasElement} Canvas on which the world is rendered. */
  canvas;

  /** @type {number} Horizontal offset used by world and parallax rendering. */
  cameraX = 0;

  /** @type {ThrownFruit[]} Thrown fruits currently managed by the world. */
  thrownFruits = [];

  /** @type {bomb[]} Thrown bombs*/
  bombs = [];

  /** @type {boolean} Whether collision bounds are drawn for debugging. */
  collisionDebug = false;

  /** @type {boolean} Whether all required world assets have loaded. */
  ready = false;

  /**
   * Creates the world, its level and its player character.
   *
   * @param {HTMLCanvasElement} canvas Canvas used for rendering.
   * @param {Game} game Game lifecycle coordinator owning this world.
   */
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.ctx = canvas.getContext("2d");

    this.level = createLevel1(this);
    this.character = new Character(this);
  }

  /**
   * Renders one frame in the established world, camera and UI order.
   *
   * The next frame is scheduled after world objects and an optional game-over
   * overlay have been rendered.
   *
   * @returns {void}
   */
  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawObject(this.level.sky);
    this.drawParallaxObjects(this.level.landscape.backgroundobject);

    this.ctx.save();
    this.ctx.translate(this.cameraX, 0);

    this.drawObject(this.character);
    this.drawObjects(this.level.enemies);
    this.drawObjects(this.thrownFruits);
    this.drawObjects(this.bombs);

    this.ctx.restore();

    this.drawParallaxObjects(this.level.fruits);
    this.drawParallaxObjects(this.level.landscape.grass);

    if (this.game.gameOver) {
      this.game.gameOver.update();
      this.game.gameOver.draw();
    }

    requestAnimationFrame(() => this.draw());
  }

  /**
   * Draws one renderable object with hurt blinking, mirroring and optional
   * collision debugging.
   *
   * @param {DrawableObject} object Object to render.
   * @returns {void}
   */
  drawObject(object) {
    if (!object.img || !object.img.complete || object.img.naturalWidth === 0) {
      return;
    }
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

    if (this.collisionDebug) this.drawCollisionDebug(object);
  }

  /**
   * Draws the outer and collision-adjusted bounds of an object.
   *
   * @param {DrawableObject} object Object whose bounds should be visualized.
   * @returns {void}
   */
  drawCollisionDebug(object) {
    const offsets = object.getCollisionOffsets
      ? object.getCollisionOffsets()
      : {
          left: object.leftOffset ?? 0,
          right: object.rightOffset ?? 0,
          top: object.topOffset ?? 0,
          bottom: object.bottomOffset ?? 0,
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

  /**
   * Draws an object mirrored horizontally at its world position.
   *
   * @param {DrawableObject} object Object to render in mirrored orientation.
   * @returns {void}
   */
  drawMirroredObject(object) {
    this.ctx.save();
    this.ctx.translate(object.x + object.width, object.y);
    this.ctx.scale(-1, 1);
    this.ctx.drawImage(object.img, 0, 0, object.width, object.height);
    this.ctx.restore();
  }

  /**
   * Draws each object in a collection.
   *
   * @param {DrawableObject[]} objects Objects to render.
   * @returns {void}
   */
  drawObjects(objects) {
    objects.forEach((obj) => {
      this.drawObject(obj);
    });
  }

  /**
   * Draws objects using their individual parallax factors and the camera.
   *
   * @param {Array} objects Parallax objects to render.
   * @returns {void}
   */
  drawParallaxObjects(objects) {
    objects.forEach((object) => {
      this.ctx.save();
      this.ctx.translate(this.cameraX * object.parallaxFactor, 0);
      this.drawObject(object);
      this.ctx.restore();
    });
  }

  /**
   * Notifies the game lifecycle when the character has died.
   *
   * @returns {void}
   */
  characterDied() {
    this.game.endGame();
  }

  /**
   * Resolves collisions between flying thrown fruits and level enemies.
   *
   * The existing Gnome- and Robot-specific hit reactions are applied before
   * the collided fruit is removed after its hit animation delay.
   *
   * @returns {void}
   */
  checkThrownFruitCollisions() {
    for (let fruits = this.thrownFruits.length - 1; fruits >= 0; fruits--) {
      const fruit = this.thrownFruits[fruits];
      if (fruit.state !== "flying") continue;

      for (const enemy of this.level.enemies) {
        if (fruit.isColliding(enemy)) {
          console.log("enemy hit", enemy);

          fruit.hit();

          if (enemy instanceof Gnome) {
            enemy.hitByFruit(fruit.direction);
          } else if (enemy instanceof Robot) {
            enemy.hitByFruit();
          }

          setTimeout(() => {
            const index = this.thrownFruits.indexOf(fruit);
            if (index !== -1) {
              this.thrownFruits.splice(index, 1);
            }
          }, 240);

          break;
        }
      }
    }
  }

  /**
   * Returns every drawable object whose images are required before gameplay.
   *
   * @returns {DrawableObject[]} Objects included in the asset-loading barrier.
   */
  getAssetObjects() {
    return [
      this.character,
      this.level.sky,
      ...this.level.enemies,
      ...this.level.fruits,
      ...this.level.landscape.backgroundobject,
      ...this.level.landscape.grass,
    ];
  }

  /**
   * Waits for all required world assets before marking the world as ready.
   *
   * @returns {Promise<void>} Promise that resolves after every tracked image
   * has loaded and the world has been marked as ready.
   */
  async waitForAssets() {
    const objects = this.getAssetObjects();

    await Promise.all(objects.map((object) => object.waitForImages()));

    this.ready = true;
  }

  updateBombs() {
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];

      bomb.update();

      if (!bomb.isFinished()) continue;

      if (bomb.isColliding(this.character)) {
        this.character.takeDamage(20);
      }

      this.bombs.splice(i, 1);
    }
  }
}
