class Robot extends MovableObject {
  height = 160;
  width = 160;

  constructor() {
    super().loadImage("./img/robot-boss/01_Idle/idle_000.png");
    this.x = 300;
    this.y = 300;
  }
}
