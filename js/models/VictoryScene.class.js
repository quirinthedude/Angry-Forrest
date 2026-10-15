/** Coordinates the post-victory bow, sinking character and growing-tree scene. */
class VictoryScene {
  state = "bow";
  /** @type {boolean} Whether this scene may continue its lifecycle. */
  isActive = true;

  /** @type {number|null} Pending timeout that starts the sinking phase. */
  bowTimeout = null;

  /** Creates the victory scene for the completed world.
   * @param {World} world Completed game world.
   */
  constructor(world) {
    this.world = world;
    this.character = world.character;

    this.character.y = this.character.groundY;
    this.character.speedY = 0;

    this.lastUpdatedAt = performance.now();
    this.endingText = null;

    this.treeX =
      this.character.x + this.world.cameraX + this.character.width / 2 - 175;

    const characterGround =
      this.character.groundY +
      this.character.height -
      this.character.bottomOffset;

    this.treeY = characterGround - 350;

    this.startBow();
  }

  /** Starts the character bow and schedules the following waiting state. */
  startBow() {
    this.character.bow();

    const bowDuration = this.character.IMAGES_BOW.length * 100;

    this.bowTimeout = setTimeout(() => {
      this.bowTimeout = null;
      if (!this.isActive) return;
      this.state = "sink";
    }, bowDuration);
  }

  /** Advances scene timing, character movement and ending text. */
  update() {
    if (!this.isActive) return;
    const now = performance.now();
    const deltaTime = now - this.lastUpdatedAt;
    this.lastUpdatedAt = now;

    if (this.state === "sink") {
      this.sinkCharacter();
    }

    if (this.endingText) {
      this.endingText.update(deltaTime);
    }
  }

  /** Moves the character below the canvas and starts tree growth afterwards. */
  sinkCharacter() {
    if (!this.isActive) return;
    this.character.y += 2;

    if (this.character.y >= this.world.canvas.height) {
      this.state = "loadingTree";
      this.startTreeGrowing();
    }
  }

  /** Draws the growing tree and optional scrolling ending text. */
  draw() {
    if (!this.isActive) return;
    if (this.tree) {
      this.world.renderer.drawObject(this.tree);
    }

    if (this.endingText) {
      this.endingText.draw();
    }
  }

  /**
   * Loads the tree and starts the victory sequence.
   *
   * @returns {Promise<void>} Resolves after the tree images have loaded.
   */
  async startTreeGrowing() {
    if (!this.isActive) return;
    this.tree = new GrowingTree(this.treeX, this.treeY);

    await this.tree.waitForImages();

    if (!this.isActive) return;

    this.setupVictoryPresentation();
    this.state = "treeGrowing";
    this.tree.grow();
  }

  /** Prepares the victory text and restart prompt. */
  setupVictoryPresentation() {
    this.endingText = new ScrollingText(
      this.world.ctx,
      "CONGRATULATIONS! PEACE HAS RETURNED TO THE FOREST. ENTIE HAS FOUND PEACE AT LAST AND RETURNS TO HIS COMMUNITY IN THE WOODS.",
      { height: 32, speed: 156, y: this.world.canvas.height - 26 },
    );

    this.world.game.syncStoryButton();
    this.world.game.endScreen = new EndGame(this.world.canvas, null, true);
  }

  /** Stops pending scene timers and any active tree animation safely. */
  stop() {
    if (!this.isActive) return;
    this.isActive = false;
    clearTimeout(this.bowTimeout);
    this.bowTimeout = null;
    this.tree?.stopAnimation();
  }
}
