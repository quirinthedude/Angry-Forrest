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

  /** @type {Bomb[]} Boss bombs currently managed by the world. */
  bombs = [];

  /** @type {boolean} Whether collision bounds are drawn for debugging. */
  collisionDebug = false;

  /** @type {boolean} Whether all required world assets have loaded. */
  ready = false;

  /** @type {number|null} Identifier of the scheduled render frame. */
  animationFrame = null;

  /** @type {boolean} Whether the render loop may schedule another frame. */
  isRunning = true;

  /** @type {WorldRenderer} Renderer for the world canvas layers and objects. */
  renderer;

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
    this.renderer = new WorldRenderer(this);
  }

  /**
   * Renders one frame in the established world, camera and UI order.
   *
   * The next frame is scheduled after world objects and an optional end-game
   * overlay have been rendered.
   *
   */
  draw() {
    if (!this.isRunning) return;
    this.renderer.renderWorld();
    this.drawOverlays();
    this.animationFrame = requestAnimationFrame(() => this.draw());
  }

  /** Updates and draws active victory or game-over overlays. */
  drawOverlays() {
    if (this.game.startScene) {
      this.game.startScene.update();
      this.game.startScene?.draw();
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
   * Notifies the game lifecycle when the character has died.
   *
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
    if (enemy instanceof Robot && !enemy.isActivated) return false;
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
      this.handleBombExplosion(bomb);

      if (bomb.isFinished()) {
        this.bombs.splice(i, 1);
      }
    }
  }

  /** Applies one explosion's damage when its collision window is active.
   * @param {Bomb} bomb Bomb whose explosion should be checked.
   */
  handleBombExplosion(bomb) {
    if (
      bomb.isExploding() &&
      !bomb.hasDamagedCharacter &&
      bomb.isColliding(this.character)
    ) {
      this.character.takeDamage(bomb.damage);
      bomb.hasDamagedCharacter = true;
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
    const grassFactor = this.level.landscape.grass[0]?.parallaxFactor ?? 1;

    this.thrownFruits.forEach((fruit) => {
      const wasFlying = fruit.state === "flying";

      fruit.update();

      if (wasFlying && fruit.state === "landed") {
        fruit.x += this.cameraX * (1 - grassFactor);
        fruit.parallaxFactor = grassFactor;
      }
    });
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

    this.bombs.forEach((bomb) => {
      bomb.stop?.();
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
