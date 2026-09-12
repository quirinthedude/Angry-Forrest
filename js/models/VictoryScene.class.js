class VictoryScene {
  state = "bow";
  waitStartedAt = 0;

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

  startBow() {
    this.character.bow();

    const bowDuration = this.character.IMAGES_BOW.length * 100;

    setTimeout(() => {
      this.state = "waitAfterBow";
      this.waitStartedAt = Date.now();
    }, bowDuration);
  }

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

  waitAfterBow() {
    if (Date.now() - this.waitStartedAt >= 1500) {
      this.state = "sink";
    }
  }

  sinkCharacter() {
    this.character.y += 2;

    if (this.character.y >= this.world.canvas.height) {
      this.state = "loadingTree";
      this.startTreeGrowing();
    }
  }

  draw() {
    if (this.tree) {
      this.world.drawObject(this.tree);
    }

    if (this.endingText) {
      this.endingText.draw();
    }
  }

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

    this.state = "treeGrowing";
    this.tree.grow();
  }
}
