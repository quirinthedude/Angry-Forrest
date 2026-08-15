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
  constructor() {
    super();
    this.loadImage(this.IMAGES_IDLE[0]);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_ATTACKING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_JUMPING);
    this.x = 40;
    this.y = 295;
    this.mirrorX = true;

    this.animate(this.IMAGES_WALKING);
  }
}
