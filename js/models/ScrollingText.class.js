/** Renders a horizontally scrolling bitmap-glyph message on a canvas. */
class ScrollingText {
  /** Creates a scrolling message and begins loading its glyph images.
   * @param {CanvasRenderingContext2D} ctx Canvas context used for rendering.
   * @param {string} text Message to display.
   * @param {{speed?: number, y?: number, height?: number, gap?: number}} options Display options.
   */
  constructor(ctx, text, options = {}) {
    this.ctx = ctx;
    this.text = text.toUpperCase();
    this.speed = options.speed ?? 45;
    this.y = options.y ?? ctx.canvas.height - 24;
    this.height = options.height ?? 42;
    this.gap = options.gap ?? 6;
    this.x = ctx.canvas.width;
    this.images = {};
    this.ready = false;
    this.loadGlyphs();
  }

  /** Loads each unique glyph required by the message. */
  loadGlyphs() {
    const paths = this.getGlyphPaths();
    if (paths.size === 0) {
      this.ready = true;
      return;
    }
    let loadedImages = 0;
    paths.forEach((path) =>
      this.loadGlyph(path, () => {
        loadedImages++;
        if (loadedImages === paths.size) this.ready = true;
      }),
    );
  }

  /** Collects the unique asset paths required by the configured text.
   * @returns {Set<string>} Unique glyph asset paths.
   */
  getGlyphPaths() {
    return new Set(
      [...this.text]
        .filter((character) => character !== " ")
        .map((character) => this.getGlyphPath(character))
        .filter(Boolean),
    );
  }

  /** Loads one glyph and invokes a callback when it finishes loading.
   * @param {string} path Glyph asset path.
   * @param {Function} onLoad Completion callback.
   */
  loadGlyph(path, onLoad) {
    const image = new Image();
    image.onload = onLoad;
    image.src = path;
    this.images[path] = image;
  }

  /** Advances the message position and wraps it after it leaves the canvas.
   * @param {number} deltaTime Elapsed time since the previous update in ms.
   */
  update(deltaTime) {
    this.x -= (this.speed * deltaTime) / 1000;

    if (this.x < -this.measureText()) {
      this.x = this.ctx.canvas.width;
    }
  }

  /** Draws all loaded glyphs at the current horizontal position. */
  draw() {
    if (!this.ready) return;
    let drawX = this.x;
    for (const character of this.text) drawX = this.drawCharacter(character, drawX);
  }

  /** Draws one glyph or advances over a space/unknown glyph.
   * @param {string} character Character to draw.
   * @param {number} drawX Current horizontal drawing position.
   * @returns {number} Horizontal position for the following character.
   */
  drawCharacter(character, drawX) {
    const image = this.images[this.getGlyphPath(character)];
    if (character === " " || !image) return drawX + this.height * 0.55;
    const width = image.width * (this.height / image.height);
    this.ctx.drawImage(image, drawX, this.y - this.height, width, this.height);
    return drawX + width + this.gap;
  }

  /** Calculates the rendered width of the message.
   * @returns {number} Approximate message width in pixels.
   */
  measureText() {
    return [...this.text].reduce(
      (width, character) => width + this.getCharacterWidth(character),
      0,
    );
  }

  /** Calculates the rendered width contribution of one character.
   * @param {string} character Character to measure.
   * @returns {number} Character width including its spacing.
   */
  getCharacterWidth(character) {
    const image = this.images[this.getGlyphPath(character)];
    if (character === " " || !image) return this.height * 0.55;
    return image.width * (this.height / image.height) + this.gap;
  }

  /** Adjusts scrolling speed within the supported range.
   * @param {number} amount Speed delta in pixels per second.
   */
  changeSpeed(amount) {
    this.speed = Math.max(20, Math.min(300, this.speed + amount));
  }

  /** Resolves a character to its bitmap glyph asset path.
   * @param {string} character Character to resolve.
   * @returns {string|undefined} Matching asset path when available.
   */
  getGlyphPath(character) {
    const glyphKey = TITLE_GLYPH_ALIASES[character] ?? character;
    return TITLE_GLYPHS[glyphKey];
  }
}
