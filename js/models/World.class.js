/**
 * Coordinates the active game world and its rendering lifecycle.
 *
 * World connects the canvas, camera, character, level, thrown fruits,
 * collision checks, end-game rendering and the asset-loading boundary used
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

  /** @type {Bomb[]} Thrown bombs*/
  bombs = [];

  /** @type {boolean} Whether collision bounds are drawn for debugging. */
  collisionDebug = false;

  /** @type {boolean} Whether all required world assets have loaded. */
  ready = false;

  animationFrame = null;
  isRunning = true;

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
   * The next frame is scheduled after world objects and an optional end-game
   * overlay have been rendered.
   *
   * @returns {void}
   */
  draw() {
    if (!this.isRunning) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.drawBackground();
    this.drawActors();
    this.drawForeground();
    this.drawOverlays();
    requestAnimationFrame(() => this.draw());
  }

  /** Draws the sky and distant background layers. */
  drawBackground() {
    this.drawObject(this.level.sky);
    this.drawParallaxObjects(this.level.landscape.backgroundobject);
  }

  /** Draws camera-translated actors and active projectiles. */
  drawActors() {
    this.ctx.save();
    this.ctx.translate(this.cameraX, 0);
    this.drawObject(this.character);
    this.drawObjects(this.level.enemies);
    this.drawObjects(this.thrownFruits);
    this.drawObjects(this.bombs);
    this.ctx.restore();
  }

  /** Draws foreground parallax layers that appear above the actors. */
  drawForeground() {
    this.drawParallaxObjects(this.level.fruits);
    this.drawParallaxObjects(this.level.landscape.grass);
  }

  /** Updates and draws active victory or game-over overlays. */
  drawOverlays() {
    if (this.game.startScene) {
      this.game.startScene.update();
      this.game.startScene.draw();
    }
    if (this.game.victoryScene) {
      this.game.victoryScene.update();
      this.game.victoryScene.draw();
    }
    if (this.game.endScreen) {
      this.game.endScreen.update();
      this.game.endScreen.draw();
    }
  }

  /**
   * Draws one renderable object with hurt blinking, mirroring and optional
   * collision debugging.
   *
   * @param {DrawableObject} object Object to render.
   * @returns {void}
   */
  drawObject(object) {
    if (this.shouldSkipObject(object)) return;
    if (object.shouldMirror()) {
      this.drawMirroredObject(object);
    } else {
      this.drawRegularObject(object);
    }
    if (this.collisionDebug) this.drawCollisionDebug(object);
  }

  /** Determines whether an object is not ready or should blink invisible.
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

  /** Draws an object without applying horizontal mirroring.
   * @param {DrawableObject} object Object to render.
   */
  drawRegularObject(object) {
    this.ctx.drawImage(
      object.img,
      object.x,
      object.y,
      object.width,
      object.height,
    );
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
        if (this.handleThrownFruitCollision(fruit, enemy)) break;
      }
    }
  }

  /** Applies the appropriate enemy reaction to one colliding fruit.
   * @param {ThrownFruit} fruit Flying fruit that hit an enemy.
   * @param {MovableObject} enemy Enemy touched by the fruit.
   * @returns {boolean} Whether a collision was handled.
   */
  handleThrownFruitCollision(fruit, enemy) {
    if (!fruit.isColliding(enemy)) return false;
    console.log("enemy hit", enemy);
    fruit.hit();
    if (enemy instanceof Gnome) enemy.hitByFruit(fruit.direction);
    if (enemy instanceof Robot) enemy.hitByFruit();
    setTimeout(() => this.removeThrownFruit(fruit), 240);
    return true;
  }

  /** Removes a thrown fruit if it is still present after its hit animation.
   * @param {ThrownFruit} fruit Fruit scheduled for removal.
   */
  removeThrownFruit(fruit) {
    const index = this.thrownFruits.indexOf(fruit);
    if (index !== -1) this.thrownFruits.splice(index, 1);
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

  /** Advances bombs, applies finished-bomb damage and removes them. */
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

  /** Updates thrown fruits, bombs, collisions and enemy behavior. */
  updateWorldObjects() {
    this.updateThrownFruits();
    this.updateBombs();
    this.checkThrownFruitCollisions();
    this.updateEnemies();
  }

  /** Advances every thrown fruit managed by the world. */
  updateThrownFruits() {
    this.thrownFruits.forEach((fruit) => fruit.update());
  }

  /** Advances each enemy according to its concrete behavior type. */
  updateEnemies() {
    this.level.enemies.forEach((enemy) => {
      if (enemy instanceof Gnome) {
        enemy.updateKnockout();
      }
      if (enemy instanceof Robot) {
        enemy.updateFightBehaviour();
      }
      if (enemy instanceof MiniRobot) {
        enemy.update();
      }
    });
  }

  /** Stops rendering and clears actor animation or movement timers. */
  stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.animationFrame);

    this.character.stop?.();

    this.level.enemies.forEach((enemy) => {
      enemy.stop?.();
    });
  }

  /** Places actors with a ground level back on that level and clears velocity. */
  resetActorsToGround() {
    const actors = [this.character, ...this.level.enemies];

    actors.forEach((actor) => {
      if (typeof actor.groundY !== "number") return;

      actor.y = actor.groundY;
      actor.speedY = 0;
    });
  }
}
