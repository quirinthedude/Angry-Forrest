/** Manages fullscreen scaling, orientation feedback and gameplay UI visibility. */
class DisplayController {
  /** Creates the display controller and registers viewport listeners. */
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

    const isFullscreen = document.fullscreenElement === wrapper;

    const scale = isFullscreen
      ? Math.min(wrapper.clientWidth / 866, wrapper.clientHeight / 618)
      : Math.min(wrapper.clientWidth / 866, wrapper.clientHeight / 618, 1);

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
    if (!this.isMobileDevice()) return;

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
    const selectors = [
      ".character-energy",
      ".robot-energy",
      // ".top-controls",
      ".bottom-controls",
    ];

    selectors.forEach((selector) => {
      const element = document.querySelector(selector);
      if (element) element.hidden = !visible;
    });

    // const energyBar = document.querySelector(".character-energy");
    // if (energyBar) energyBar.hidden = !visible;
    // const energyBarR = document.querySelector(".robot-energy");
    // if (energyBarR) energyBarR.hidden = !visible;
  }

  /** Synchronizes the mute checkbox with the current audio state.
   * @param {boolean} isMuted Whether the game audio is muted.
   * @returns {void}
   */
  updateMuteUI(isMuted) {
    const soundToggle = document.querySelector(".sound-toggle-input");

    if (soundToggle) {
      soundToggle.checked = isMuted;
    }
  }

  /** Determines whether the current device matches the touch-only mobile query.
   * @returns {boolean} Whether the current device is treated as mobile.
   */
  isMobileDevice() {
    return window.matchMedia("(hover: none) and (pointer: none)").matches;
  }

  /** Determines whether the orientation prompt should block gameplay.
   * @returns {boolean} Whether a mobile device is currently in portrait mode.
   */
  requiresLandscape() {
    return this.isMobileDevice() && !this.isLandscape();
  }
}
