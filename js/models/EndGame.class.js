/** Controls the animated game-over or press-enter overlay. */
class EndGame {
  state = "in";
  currentIndex = 0;
  waitStartedAt = 0;
  waitDuration = 3000;

  /** Creates an overlay and its banner sequence.
   * @param {HTMLCanvasElement} canvas Canvas used for rendering.
   * @param {string|null} endGameImagePath Game-over image path.
   * @param {boolean} pressEnterOnly Whether only the prompt is shown.
   */
  constructor(canvas, endGameImagePath = null, pressEnterOnly = false) {
    this.canvas = canvas;
    this.banners = this.createBanners(endGameImagePath, pressEnterOnly);
  }

  /** Creates the banners in the order in which they should be displayed.
   * @param {string|null} endGameImagePath Game-over image path.
   * @param {boolean} pressEnterOnly Whether only the prompt is shown.
   * @returns {SlidingBanner[]} The configured banner sequence.
   */
  createBanners(endGameImagePath, pressEnterOnly) {
    const banners = [];

    if (!pressEnterOnly) {
      banners.push(new SlidingBanner(this.canvas, endGameImagePath));
    }

    banners.push(
      new SlidingBanner(
        this.canvas,
        "./img/icons/press_enter.png",
        420,
        150,
        10,
        true,
      ),
      new SlidingBanner(
        this.canvas,
        "./img/icons/tap.png",
        420,
        150,
        10,
        true,
      ),
    );

    return banners;
  }

  /** Returns the banner currently controlled by the sequence. */
  currentBanner() {
    return this.banners[this.currentIndex];
  }

  /** Advances the generic in, wait and out sequence by one frame. */
  update() {
    if (this.state === "in") {
      if (this.currentBanner().moveIn()) {
        this.state = "wait";
        this.waitStartedAt = performance.now();
      }
    } else if (this.state === "wait") {
      this.wait();
    } else if (this.state === "out") {
      this.moveOut();
    }
  }

  /** Switches to the out state after the display duration elapsed. */
  wait() {
    if (performance.now() - this.waitStartedAt >= this.waitDuration) {
      this.state = "out";
    }
  }

  /** Moves the current banner out and prepares the next one. */
  moveOut() {
    if (!this.currentBanner().moveOut()) return;

    this.currentIndex = (this.currentIndex + 1) % this.banners.length;
    this.currentBanner().reset();
    this.state = "in";
  }

  /** Draws the currently active banner. */
  draw() {
    this.currentBanner().draw();
  }
}
