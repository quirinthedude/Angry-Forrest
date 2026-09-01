class ScrollingText {
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

  loadGlyphs() {
    const paths = new Set();

    for (const character of this.text) {
      const path = TITLE_GLYPHS[character];
      if (path) paths.add(path);
    }

    if (paths.size === 0) {
      this.ready = true;
      return;
    }

    let loadedImages = 0;

    paths.forEach((path) => {
      const image = new Image();
      image.onload = () => {
        loadedImages++;
        if (loadedImages === paths.size) {
          this.ready = true;
        }
      };
      image.src = path;
      this.images[path] = image;
    });
  }

  update(deltaTime) {
    this.x -= (this.speed * deltaTime) / 1000;

    if (this.x < -this.measureText()) {
      this.x = this.ctx.canvas.width;
    }
  }

  draw() {
    if (!this.ready) return;

    let drawX = this.x;

    for (const character of this.text) {
      if (character === " ") {
        drawX += this.height * 0.55;
        continue;
      }

      const path = TITLE_GLYPHS[character];
      const image = this.images[path];
      if (!image) {
        drawX += this.height * 0.55;
        continue;
      }

      const scale = this.height / image.height;
      const width = image.width * scale;
      this.ctx.drawImage(
        image,
        drawX,
        this.y - this.height,
        width,
        this.height,
      );
      drawX += width + this.gap;
    }
  }

  measureText() {
    return [...this.text].reduce((width, character) => {
      if (character === " ") return width + this.height * 0.55;

      const image = this.images[TITLE_GLYPHS[character]];
      if (!image) return width + this.height * 0.55;

      return width + image.width * (this.height / image.height) + this.gap;
    }, 0);
  }
}
