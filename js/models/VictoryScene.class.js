class VictoryScene {
  state = "bow";
  waitStartedAt = 0;
  TREE_IMAGES = createAnimationImages("./img/growing_tree/tree_", 10);

  constructor(world) {
    this.world = world;
    this.character = world.character;

    this.treeX =
      this.character.x + this.world.cameraX + this.character.width / 2 - 175;

    const characterGround =
      this.character.y + this.character.height - this.character.bottomOffset;

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
    if (this.state === "waitAfterBow") {
      this.waitAfterBow();
    } else if (this.state === "sink") {
      this.sinkCharacter();
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
    if (!this.tree) return;

    this.world.drawObject(this.tree);
  }

  async startTreeGrowing() {
    this.tree = new GrowingTree(this.treeX, this.treeY);

    await this.tree.waitForImages();

    this.state = "treeGrowing";
    this.tree.grow();
  }
}
