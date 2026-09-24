/** Coordinates the post-victory bow, sinking character and growing-tree scene. */
class VictoryScene {
  state = "bow";
  waitStartedAt = 0;

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

    setTimeout(() => {
      this.state = "waitAfterBow";
      this.waitStartedAt = Date.now();
    }, bowDuration);
  }

  /** Advances scene timing, character movement and ending text. */
  update() {
    const now = performance.now();
    const deltaTime = now - this.lastUpdatedAt;
    this.lastUpdatedAt = now;

    if (this.state === "waitAfterBow") {
      this.waitAfterBow();
    } else if (this.state === "sink") {
      this.sinkCharacter();
    }

    if (this.endingText) {
      this.endingText.update(deltaTime);
    }
  }

  /** Switches from the bow wait to the character sinking phase. */
  waitAfterBow() {
    if (Date.now() - this.waitStartedAt >= 1500) {
      this.state = "sink";
    }
  }

  /** Moves the character below the canvas and starts tree growth afterwards. */
  sinkCharacter() {
    this.character.y += 2;

    if (this.character.y >= this.world.canvas.height) {
      this.state = "loadingTree";
      this.startTreeGrowing();
    }
  }

  /** Draws the growing tree and optional scrolling ending text. */
  draw() {
    if (this.tree) {
      this.world.drawObject(this.tree);
    }

    if (this.endingText) {
      this.endingText.draw();
    }
  }

  /** Loads the tree, creates the ending overlay and starts tree animation. */
  async startTreeGrowing() {
    this.tree = new GrowingTree(this.treeX, this.treeY);

    await this.tree.waitForImages();

    this.endingText = new ScrollingText(
      this.world.ctx,
      "CONGRATULATIONS! PEACE HAS RETURNED TO THE FOREST. ENTIE HAS FOUND PEACE AT LAST AND RETURNS TO HIS COMMUNITY IN THE WOODS.",
      {
        height: 32,
        speed: 52,
        y: this.world.canvas.height - 26,
      },
    );

    this.world.game.endScreen = new EndGame(this.world.canvas, null, true);

    this.state = "treeGrowing";
    this.tree.grow();
  }
}
