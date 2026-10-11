/**
 * Coordinates player fruit collection, inventory and throwing.
 *
 * The controller composes with Character and reads the current World state
 * through that character without owning fruit physics or enemy collisions.
 */
class FruitController {
  /** @type {Character} Character whose fruit interactions are controlled. */
  character;

  /** @type {number} Maximum number of fruits the player may carry. */
  maxFruitInventory = 3;

  /** @type {number} Current number of fruits carried by the player. */
  fruitInventory = 0;

  /** @type {Set<Fruit>} Fruits touching the character in the previous update. */
  activeFruitCollision = new Set();

  /**
   * Creates a fruit controller for the supplied character.
   *
   * @param {Character} character Character whose fruit interactions are managed.
   */
  constructor(character) {
    this.character = character;
  }

  /** Collects newly touched level fruits and records current collisions. */
  updateFruitCollection() {
    const fruits = this.checkFruitCollision();
    for (const fruit of fruits) {
      if (!this.activeFruitCollision.has(fruit)) this.collectFruit(fruit);
    }
    this.activeFruitCollision = new Set(fruits);
  }

  /** Collects a landed thrown fruit when the player is touching it. */
  collectLandedFruitIfColliding() {
    const landedFruit = this.checkLandedFruitCollision();
    if (landedFruit) this.collectLandedFruit(landedFruit);
  }

  /** Finds level fruits whose adjusted bounds overlap the player.
   * @returns {Fruit[]} Fruits currently colliding with the player.
   */
  checkFruitCollision() {
    const collisions = [];
    const characterBounds = this.getCharacterFruitBounds();

    for (const fruit of this.character.world.level.fruits) {
      if (this.isFruitColliding(fruit, characterBounds)) collisions.push(fruit);
    }

    return collisions;
  }

  /** Calculates the player's adjusted bounds in the fruit collision space.
   * @returns {{left: number, right: number, top: number, bottom: number}} Character collision bounds.
   */
  getCharacterFruitBounds() {
    const character = this.character;
    const offsets = character.getCollisionOffsets();
    const screenX = character.x + character.world.cameraX;

    return {
      left: screenX + offsets.left,
      right: screenX + character.width - offsets.right,
      top: character.y + offsets.top,
      bottom: character.y + character.height - offsets.bottom,
    };
  }

  /** Checks one fruit against the player's adjusted collision bounds.
   * @param {Fruit} fruit Fruit to test.
   * @param {{left: number, right: number, top: number, bottom: number}} characterBounds Player collision bounds.
   * @returns {boolean} Whether the fruit overlaps the player.
   */
  isFruitColliding(fruit, characterBounds) {
    const offsets = fruit.getCollisionOffsets();
    const screenX = fruit.x + this.character.world.cameraX * fruit.parallaxFactor;
    const fruitLeft = screenX + offsets.left;
    const fruitRight = screenX + fruit.width - offsets.right;
    const fruitTop = fruit.y + offsets.top;
    const fruitBottom = fruit.y + fruit.height - offsets.bottom;

    return (
      characterBounds.right > fruitLeft &&
      characterBounds.left < fruitRight &&
      characterBounds.bottom > fruitTop &&
      characterBounds.top < fruitBottom
    );
  }

  /** Removes a level fruit, adds it to inventory and updates UI/audio.
   * @param {Fruit} fruit Fruit collected by the player.
   */
  collectFruit(fruit) {
    if (this.fruitInventory >= this.maxFruitInventory) return;

    const fruits = this.character.world.level.fruits;
    const index = fruits.indexOf(fruit);
    if (index === -1) return;

    fruits.splice(index, 1);
    this.fruitInventory++;
    this.playCollectionSound();
    this.updateFruitInventory();
  }

  /** Synchronizes inventory slot images with the collected fruit count. */
  updateFruitInventory() {
    const slots = document.querySelectorAll(".fruit-slot");

    slots.forEach((slot, index) => {
      slot.src =
        index < this.fruitInventory
          ? "./img/objects/fruit.png"
          : "./img/objects/fruit_bw.png";
    });
  }

  /** Creates a thrown fruit when requested and inventory is available. */
  throwFruit() {
    const character = this.character;
    if (!character.world.keyboard.throw) return;
    character.sleep.reset();
    if (this.fruitInventory <= 0) return;
    this.fruitInventory--;
    this.updateFruitInventory();

    const fruit = new ThrownFruit(
      character.x + character.width / 2,
      character.y + 50,
      character.direction,
    );

    character.world.thrownFruits.push(fruit);
    character.world.keyboard.throw = false;
  }

  /** Finds a landed thrown fruit colliding with the player.
   * @returns {ThrownFruit|null} Collectible landed fruit or null.
   */
  checkLandedFruitCollision() {
    for (const fruit of this.character.world.thrownFruits) {
      if (fruit.state === "landed" && this.isCollidingWithLandedFruit(fruit)) {
        return fruit;
      }
    }

    return null;
  }

  /**
   * Tests collision against a landed fruit in its parallax coordinate space.
   *
   * @param {ThrownFruit} fruit Landed thrown fruit to test.
   * @returns {boolean} Whether the player and fruit bounds overlap.
   */
  isCollidingWithLandedFruit(fruit) {
    const character = this.character;
    const characterOffsets = character.getCollisionOffsets();
    const fruitOffsets = fruit.getCollisionOffsets();
    const characterX = character.x + character.world.cameraX;
    const fruitX = fruit.x + character.world.cameraX * (fruit.parallaxFactor ?? 1);

    return (
      characterX + character.width - characterOffsets.right >
        fruitX + fruitOffsets.left &&
      characterX + characterOffsets.left <
        fruitX + fruit.width - fruitOffsets.right &&
      character.y + character.height - characterOffsets.bottom >
        fruit.y + fruitOffsets.top &&
      character.y + characterOffsets.top <
        fruit.y + fruit.height - fruitOffsets.bottom
    );
  }

  /** Collects a landed thrown fruit and removes it from the world.
   * @param {ThrownFruit} fruit Landed fruit to collect.
   */
  collectLandedFruit(fruit) {
    if (this.fruitInventory >= this.maxFruitInventory) return;

    const fruits = this.character.world.thrownFruits;
    const index = fruits.indexOf(fruit);
    if (index === -1) return;

    fruits.splice(index, 1);
    this.fruitInventory++;
    this.updateFruitInventory();
    this.playCollectionSound();
  }

  /** Replays the existing Character-owned sound for fruit collection. */
  playCollectionSound() {
    const sound = this.character.fruitSound;
    sound.currentTime = 0;
    sound.play();
  }
}
