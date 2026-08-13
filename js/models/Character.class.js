class Character extends MovableObject {
  height = 180;
  width = 120;
  IMAGES_WALKING = (() => {
    const images = [];
    for (let i = 0; i < 20; i++) {
      images.push(
        `/img/character/walk/6_animation_walk_${String(i).padStart(3, "0")}.png`,
      );
    }
    return images;
  })();
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
