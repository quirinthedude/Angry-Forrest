class BackgroundObject extends MovableObject {
  constructor(imagepath) {
    super().loadImage(imagepath);
    this.x = 0;
    this.y = 0;
    this.width = 866;
    this.height = 618;
  }
}
