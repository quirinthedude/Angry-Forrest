class Robot extends MovableObject {
  height = 160;
  width = 160;

  constructor(x, y) {
    super().loadImage("./img/robot-boss/Idle/idle_000.png");
    this.x = x;
    this.y = y;
    this.mirrorX = true;
  }
}
