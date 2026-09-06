class ThrownFruit extends MovableObject {
  width = 50;
  height = 48;

  leftOffset = 10;
  rightOffset = 10;
  topOffset = 0;
  bottomOffset = 10;

  speedX = 4;
  speedY = -12;
  acceleration = 0.48;

  state = "flying";
  groundY = 420;

  IMAGES_HIT = [
    "./img/objects/hit1.png",
    "./img/objects/hit2.png",
    "./img/objects/hit3.png",
  ];

  constructor(x, y, direction) {
    super();
    this.loadImage("/img/objects/fruit.png");
    this.loadImages(this.IMAGES_HIT);

    this.x = x;
    this.y = y;
    this.direction = direction;
  }

  update() {
    if (this.state !== "flying") return;

    this.x += this.speedX * this.direction;
    this.y += this.speedY;
    this.speedY += this.acceleration;

    if (this.y >= this.groundY) {
      this.land();
    }
  }

  land() {
    this.state = "landed";
    this.y = this.groundY;
    this.speedX = 0;
    this.speedY = 0;
  }

  hit() {
    if (this.state !== "flying") return;

    this.state = "hit";
    this.animateOnce(this.IMAGES_HIT, 80);
  }
}
