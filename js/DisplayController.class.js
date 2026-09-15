class DisplayController {
  constructor() {
    document.addEventListener("fullscreenchange", () =>
      this.handleViewportChange(),
    );

    window.addEventListener("resize", () => this.handleViewportChange());

    window.addEventListener("orientationchange", () =>
      this.handleViewportChange(),
    );

    this.handleViewportChange();
  }

  /**
   * Updates fullscreen scaling and the orientation fallback together.
   *
   * @returns {void}
   */
  handleViewportChange() {
    this.updateFullscreenScale();
    this.updateOrientationPrompt();
  }

  /**
   * Keeps the fixed game stage proportional inside the available wrapper.
   *
   * @returns {void}
   */
  updateFullscreenScale() {
    const wrapper = document.querySelector(".game-wrapper");
    const stage = document.querySelector(".game-stage");

    if (!wrapper || !stage) return;

    const scale = Math.min(
      wrapper.clientWidth / 866,
      wrapper.clientHeight / 618,
      1,
    );

    stage.style.setProperty("--game-scale", scale);
  }

  /**
   * Shows the fallback overlay whenever the game is viewed in portrait mode.
   *
   * @returns {void}
   */
  updateOrientationPrompt() {
    const prompt = document.getElementById("orientation-prompt");
    if (!prompt) return;

    prompt.hidden = this.isLandscape();
  }

  /**
   * Returns whether the current viewport is landscape-oriented.
   *
   * @returns {boolean} Whether the viewport is wider than it is tall.
   */
  isLandscape() {
    return window.matchMedia("(orientation: landscape)").matches;
  }

  /**
   * Enters or exits browser fullscreen mode for the game surface.
   *
   * @returns {Promise<void>} Resolves after the browser handles the request.
   */
  async toggleFullscreen() {
    const wrapper = document.querySelector(".game-wrapper");

    if (!wrapper) return;

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      screen.orientation?.unlock?.();
      return;
    }

    await wrapper.requestFullscreen?.();
  }
}
