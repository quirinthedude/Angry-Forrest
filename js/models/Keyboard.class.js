/** Stores gameplay controls and their independent keyboard or pointer sources. */
class Keyboard {
  left = false;
  right = false;
  jump = false;
  throw = false;

  activeSources = new Map();
  pointerControls = new Map();

  /** Maps browser keyboard events to the shared gameplay control names. */
  getControl(event) {
    if (event.key === "ArrowLeft") return "left";
    if (event.key === "ArrowRight") return "right";
    if (event.key === "ArrowUp") return "jump";
    if (event.code === "Space") return "throw";
    return null;
  }

  /** Activates or releases one keyboard-owned gameplay control. */
  setKeyboardControl(control, pressed) {
    this.updateSource(control, "keyboard", pressed);
  }

  /** Activates one pointer-owned gameplay control. */
  pressPointer(pointerId, control) {
    this.releasePointer(pointerId);
    if (!this.isControl(control)) return;
    this.pointerControls.set(pointerId, control);
    this.updateSource(control, pointerId, true);
  }

  /** Releases the control owned by one pointer without affecting others. */
  releasePointer(pointerId) {
    const control = this.pointerControls.get(pointerId);
    if (!control) return;
    this.pointerControls.delete(pointerId);
    this.updateSource(control, pointerId, false);
  }

  /** Clears all source ownership and returns every gameplay flag to neutral. */
  reset() {
    this.activeSources.clear();
    this.pointerControls.clear();
    this.left = false;
    this.right = false;
    this.jump = false;
    this.throw = false;
  }

  /** Updates one source and reflects whether its control has any owners. */
  updateSource(control, source, pressed) {
    if (!this.isControl(control)) return;
    const wasActive = this[control];
    const sources = this.activeSources.get(control) || new Set();
    pressed ? sources.add(source) : sources.delete(source);
    if (sources.size === 0) this.activeSources.delete(control);
    else this.activeSources.set(control, sources);
    this[control] = pressed || (wasActive && sources.size > 0);
  }

  /** Checks whether a data-control or keyboard mapping is supported. */
  isControl(control) {
    return ["left", "right", "jump", "throw"].includes(control);
  }
}
