class Character extends MovableObject {
  height = 180;
  width = 120;
  constructor() {
    super().loadImage("./img/character/idle/6_animation_idle_000.png");
    this.x = 40;
    this.y = 295;
    this.mirrorX = true;
  }
}
