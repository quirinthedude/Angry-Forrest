class Character extends MovableObject {
  height = 180;
  width = 120;
  IMAGES_WALKING = [
    "/img/character/walk/6_animation_walk_000.png",
    "/img/character/walk/6_animation_walk_001.png",
    "/img/character/walk/6_animation_walk_002.png",
    "/img/character/walk/6_animation_walk_003.png",
    "/img/character/walk/6_animation_walk_004.png",
    "/img/character/walk/6_animation_walk_005.png",
    "/img/character/walk/6_animation_walk_006.png",
    "/img/character/walk/6_animation_walk_007.png",
    "/img/character/walk/6_animation_walk_008.png",
    "/img/character/walk/6_animation_walk_009.png",
    "/img/character/walk/6_animation_walk_010.png",
    "/img/character/walk/6_animation_walk_011.png",
    "/img/character/walk/6_animation_walk_012.png",
    "/img/character/walk/6_animation_walk_013.png",
    "/img/character/walk/6_animation_walk_014.png",
    "/img/character/walk/6_animation_walk_015.png",
    "/img/character/walk/6_animation_walk_016.png",
    "/img/character/walk/6_animation_walk_017.png",
    "/img/character/walk/6_animation_walk_018.png",
    "/img/character/walk/6_animation_walk_019.png",
  ];
  currentImage = 0;
  constructor() {
    super();
    this.loadImage("./img/character/idle/6_animation_idle_000.png");
    this.loadImages(this.IMAGES_WALKING);
    this.x = 40;
    this.y = 295;
    this.mirrorX = true;

    this.animate();
  }

  animate() {
    setInterval(() => {
      let i = this.currentImage % this.IMAGES_WALKING.length;
      let path = this.IMAGES_WALKING[i];
      this.img = this.imageCache[path];
      this.currentImage++;
    }, 100);
  }
}
