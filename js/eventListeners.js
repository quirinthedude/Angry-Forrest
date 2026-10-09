/**
 * Forwards global keydown events to the active game instance.
 *
 * @param {KeyboardEvent} event Keyboard event received from the window.
 */
window.addEventListener("keydown", function (event) {
  if (window.game) this.window.game.handleKeyDown(event);
});

/**
 * Forwards global keyup events to the active game instance.
 *
 * @param {KeyboardEvent} event Keyboard event received from the window.
 */
window.addEventListener("keyup", function (event) {
  if (window.game) window.game.handleKeyUp(event);
});

/** Binds pointer controls and synchronizes them with gameplay input state. */
function bindTouchControls() {
  const activePointers = new Map();
  const activeControlCounts = new Map();

  document.querySelectorAll("[data-control]").forEach((button) => {
    bindTouchButton(button, activePointers, activeControlCounts);
  });
}

/**
 * Registers pointer handlers for one gameplay control button.
 *
 * @param {HTMLElement} button Button carrying a `data-control` value.
 * @param {Map<number, string>} activePointers Controls assigned to active pointers.
 * @param {Map<string, number>} activeControlCounts Active pointer count per control.
 */
function bindTouchButton(button, activePointers, activeControlCounts) {
  const control = button.dataset.control;
  const pressPointer = (event) =>
    activateTouchControl(event, button, control, activePointers, activeControlCounts);
  const releasePointer = (event) =>
    releaseTouchControl(event, activePointers, activeControlCounts);

  button.addEventListener("pointerdown", pressPointer);
  button.addEventListener("pointerup", releasePointer);
  button.addEventListener("pointercancel", releasePointer);
}

/**
 * Activates a control and records the pointer holding it.
 *
 * @param {PointerEvent} event Pointer press on the control.
 * @param {HTMLElement} button Pressed control button.
 * @param {string} control Keyboard-state property represented by the button.
 * @param {Map<number, string>} activePointers Controls assigned to active pointers.
 * @param {Map<string, number>} activeControlCounts Active pointer count per control.
 */
function activateTouchControl(
  event,
  button,
  control,
  activePointers,
  activeControlCounts,
) {
  if (window.game?.state !== "playing") return;

  event.preventDefault();
  button.setPointerCapture?.(event.pointerId);
  activePointers.set(event.pointerId, control);

  const count = (activeControlCounts.get(control) || 0) + 1;
  activeControlCounts.set(control, count);
  window.game.world.keyboard[control] = true;
}

/**
 * Releases one pointer without clearing a control held by another pointer.
 *
 * @param {PointerEvent} event Pointer release or cancellation.
 * @param {Map<number, string>} activePointers Controls assigned to active pointers.
 * @param {Map<string, number>} activeControlCounts Active pointer count per control.
 */
function releaseTouchControl(event, activePointers, activeControlCounts) {
  event.preventDefault();

  const releasedControl = activePointers.get(event.pointerId);
  if (!releasedControl) return;

  activePointers.delete(event.pointerId);
  const count = (activeControlCounts.get(releasedControl) || 1) - 1;

  if (count <= 0) {
    activeControlCounts.delete(releasedControl);
    if (window.game?.world) {
      window.game.world.keyboard[releasedControl] = false;
    }
  } else {
    activeControlCounts.set(releasedControl, count);
  }
}

/** Binds the sound and fullscreen controls in the options UI. */
function bindOptionControls() {
  const soundToggle = document.querySelector(".sound-toggle-input");
  const resizeButton = document.querySelector(".resize-button");
  const homeButton = document.querySelector(".home-button");

  /** Returns from the active game to the pre-intro screen. */
  homeButton?.addEventListener("click", () => {
    window.location.href = "./index.html";
  });

  /**
   * Applies the selected mute state to the game.
   *
   * @param {Event} event Change event emitted by the mute checkbox.
   */
  soundToggle?.addEventListener("change", (event) => {
    window.game?.setMuted(event.target.checked);
  });

  /** Requests fullscreen mode for the game surface. */
  resizeButton?.addEventListener("click", () => {
    window.game?.display.toggleFullscreen();
  });
}

/** Prevents dragging and context menus on the game surface. */
function bindGameSurfaceProtection() {
  const gameWrapper = document.querySelector(".game-wrapper");
  if (!gameWrapper) return;

  ["contextmenu", "dragstart"].forEach((eventName) => {
    /**
     * Cancels the browser action that would interfere with the game surface.
     *
     * @param {Event} event Context-menu or drag-start event.
     */
    gameWrapper.addEventListener(eventName, (event) => {
      event.preventDefault();
    });
  });
}

/** Binds canvas taps to restarting finished games or starting gameplay. */
function bindCanvasTap() {
  const canvas = document.getElementById("canvas");

  /**
   * Handles the action associated with a tap in the current game state.
   *
   * @param {PointerEvent} event Pointer release on the game canvas.
   */
  canvas.addEventListener("pointerup", (event) => {
    const state = window.game?.state;

    if (state === "gameOver" || state === "gameWon") {
      event.preventDefault();
      window.game.restart();
      return;
    }

    if (state === "intro") {
      event.preventDefault();
      window.game.startWorld();
    }
  });
}
