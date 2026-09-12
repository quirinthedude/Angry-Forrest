class MiniRobot extends Enemy {
  speed = 1.5; // schneller als Gnome
  jumpInterval = 2000;
  lastJumpTime = 0;

  update() {
    super.update();
    this.updateJump();
  }

  updateJump() {
    const now = Date.now();

    if (this.isAboveGround() || now - this.lastJumpTime < this.jumpInterval) {
      return;
    }

    this.speedY = 16;
    this.lastJumpTime = now;
  }
}
