class Character extends MovableObject {
  height = 180;
  width = 120;
  IMAGES_IDLE = createAnimationImages(
    "./img/character/idle/animation_idle_",
    20,
  );
  IMAGES_WALKING = createAnimationImages(
    "./img/character/walk/animation_walk_",
    20,
  );
  IMAGES_ATTACKING = createAnimationImages(
    "./img/character/attack/animation_attack_",
    20,
  );
  IMAGES_HURT = createAnimationImages(
    "./img/character/hurt/animation_hurt_",
    20,
  );
  IMAGES_JUMPING = createAnimationImages(
    "./img/character/jump/animation_jump_",
    12,
  );
  currentImage = 0;

  constructor(world) {
    super();
    this.world = world;
    this.loadImage(this.IMAGES_IDLE[0]);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_ATTACKING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_JUMPING);
    this.x = 240;
    this.y = 305;
    this.mirrorX = true;

    this.animate(this.IMAGES_JUMPING);
    this.moveCharacter();
  }

  moveCharacter() {
    setInterval(() => {
      if (this.world.keyboard.left && this.world.keyboard.right) return;

      if (this.world.keyboard.left) {
        this.mirrorX = false;
        this.moveLeft(1.5);
        console.log("left");
      }

      if (this.world.keyboard.right) {
        this.mirrorX = true;
        this.moveRight(1.5);
        console.log("right");
      }
      this.world.cameraX = -this.x + 240; // Update the camera position based on the character's position
    }, 1000 / 60);
  }
}
