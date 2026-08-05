class Golem extends MovableObject {
  height = 160;
  width = 160;

  constructor() {
    super().loadImage("./img/golem/Idle/0_Golem_Idle_000.png");
    this.x = 100;
    this.y = 100;
  }
}
