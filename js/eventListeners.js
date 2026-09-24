/** Forwards global keydown events to the active game instance. */
window.addEventListener("keydown", function (event) {
  if (window.game) this.window.game.handleKeyDown(event);
});

/** Forwards global keyup events to the active game instance. */
window.addEventListener("keyup", function (event) {
  if (window.game) window.game.handleKeyUp(event);
});

/** Binds pointer controls and synchronizes them with gameplay input state. */
function bindTouchControls() {
  const activePointers = new Map();
  const activeControlCounts = new Map();

  document.querySelectorAll("[data-control]").forEach((button) => {
    const control = button.dataset.control;

    /** Activates the control represented by the pressed touch button. */
    button.addEventListener("pointerdown", (event) => {
      if (window.game?.state !== "playing") return;

      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);

      activePointers.set(event.pointerId, control);

      const count = (activeControlCounts.get(control) || 0) + 1;
      activeControlCounts.set(control, count);

      window.game.world.keyboard[control] = true;
    });

    /** Releases one pointer without clearing a control held by another pointer. */
    const releasePointer = (event) => {
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
    };

    button.addEventListener("pointerup", releasePointer);
    button.addEventListener("pointercancel", releasePointer);
  });
}

/** Binds the sound and fullscreen controls in the options UI. */
function bindOptionControls() {
  const soundToggle = document.querySelector(".sound-toggle-input");
  const resizeButton = document.querySelector(".resize-button");

  /** Applies the selected mute state to the game. */
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
    /** Cancels the browser action that would interfere with the game surface. */
    gameWrapper.addEventListener(eventName, (event) => {
      event.preventDefault();
    });
  });
}

/** Binds canvas taps to restarting finished games or starting gameplay. */
function bindCanvasTap() {
  const canvas = document.getElementById("canvas");

  /** Handles the action associated with a tap in the current game state. */
  canvas.addEventListener("pointerup", (event) => {
    const state = window.game?.state;

    if (state === "gameOver" || state === "gameWon") {
      event.preventDefault();
      window.game.returnToIntro();
      return;
    }

    if (state === "intro") {
      event.preventDefault();
      window.game.startWorld();
    }
  });
}
