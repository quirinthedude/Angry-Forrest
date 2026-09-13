window.addEventListener("keydown", function (event) {
  if (window.game) this.window.game.handleKeyDown(event);
});

window.addEventListener("keyup", function (event) {
  if (window.game) window.game.handleKeyUp(event);
});

function bindTouchControls() {
  document.querySelectorAll("[data-control]").forEach((button) => {
    const control = button.dataset.control;

    const setControl = (active) => {
      if (window.game?.state !== "playing") return;
      window.game.world.keyboard[control] = active;
    };

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture?.(event.pointerId);
      setControl(true);
    });

    const releaseControl = (event) => {
      event.preventDefault();
      setControl(false);
    };

    button.addEventListener("pointerup", releaseControl);
    button.addEventListener("pointercancel", releaseControl);
  });
}

function bindOptionControls() {
  const soundToggle = document.querySelector(".sound-toggle-input");
  const resizeButton = document.querySelector(".resize-button");

  soundToggle?.addEventListener("change", (event) => {
    window.game?.setMuted(event.target.checked);
  });

  resizeButton?.addEventListener("click", () => {
    window.game?.toggleFullscreen();
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
