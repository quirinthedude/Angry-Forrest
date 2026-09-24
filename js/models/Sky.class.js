/** Represents the fixed sky background of the game world. */
class Sky extends DrawableObject {
  /** Creates and loads the sky background image. */
  constructor(img) {
    super();
    this.loadImage("./img/landscape/Sky.png");
    this.x = 0;
    this.y = 0;
    this.width = 720;
    this.height = 420;
  }
}
