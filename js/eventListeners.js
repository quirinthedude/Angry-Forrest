window.addEventListener("keydown", function (event) {
  if (window.game) this.window.game.handleKeyDown(event);
});

window.addEventListener("keyup", function (event) {
  if (window.game) window.game.handleKeyUp(event);
});

function bindTouchControls() {
  const activePointers = new Map();
  const activeControlCounts = new Map();

  document.querySelectorAll("[data-control]").forEach((button) => {
    const control = button.dataset.control;

    button.addEventListener("pointerdown", (event) => {
      if (window.game?.state !== "playing") return;

      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);

      activePointers.set(event.pointerId, control);

      const count = (activeControlCounts.get(control) || 0) + 1;
      activeControlCounts.set(control, count);

      window.game.world.keyboard[control] = true;
    });

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

function bindOptionControls() {
  const soundToggle = document.querySelector(".sound-toggle-input");
  const resizeButton = document.querySelector(".resize-button");

  soundToggle?.addEventListener("change", (event) => {
    window.game?.setMuted(event.target.checked);
  });

  resizeButton?.addEventListener("click", () => {
    window.game?.display.toggleFullscreen();
  });
}

function bindGameSurfaceProtection() {
  const gameWrapper = document.querySelector(".game-wrapper");
  if (!gameWrapper) return;

  ["contextmenu", "dragstart"].forEach((eventName) => {
    gameWrapper.addEventListener(eventName, (event) => {
      event.preventDefault();
    });
  });
}
