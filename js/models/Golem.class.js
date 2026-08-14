class Golem extends MovableObject {
  height = 120;
  width = 120;

  constructor(x, y) {
    super().loadImage("./img/golem/Idle/Golem_Idle_000.png");
    this.x = x;
    this.y = y;
    this.mirrorX = true;
  }
}
