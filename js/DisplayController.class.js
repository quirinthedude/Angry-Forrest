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

  /**
   * Starts fullscreen and attempts to lock the game to landscape mode.
   *
   * Unsupported orientation locking falls back to the orientation prompt.
   *
   * @returns {Promise<void>} Resolves after supported requests are attempted.
   */
  async prepareLandscapeMode() {
    const wrapper = document.querySelector(".game-wrapper");

    try {
      if (wrapper && !document.fullscreenElement) {
        await wrapper.requestFullscreen?.();
      }
    } catch {
      // Fullscreen is optional; the orientation fallback still remains active.
    }

    try {
      await screen.orientation?.lock?.("landscape");
    } catch {
      // iOS and unsupported browsers use the orientation prompt instead.
    }
  }

  /**
   * Shows or hides the gameplay energy bars.
   *
   * @param {boolean} visible Whether the gameplay UI should be visible.
   * @returns {void}
   */
  setGameplayUiVisible(visible) {
    const energyBar = document.querySelector(".character-energy");
    if (energyBar) energyBar.hidden = !visible;
    const energyBarR = document.querySelector(".robot-energy");
    if (energyBarR) energyBarR.hidden = !visible;
  }

  updateMuteUI() {
    const soundToggle = document.querySelector("sound-toggle-input");

    if (soundToggle) {
      soundToggle.checked = isMuted;
    }
  }
}
