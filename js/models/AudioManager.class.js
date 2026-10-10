/** Creates and tracks independent audio elements with a shared mute state. */
class AudioManager {
  /** @type {boolean} Mute state applied to newly registered audio. */
  isMuted;

  /** @type {Set<HTMLMediaElement>} Audio elements managed by this instance. */
  audioObjects;

  /** @type {Set<HTMLMediaElement>} Short-lived audio awaiting playback completion. */
  transientAudioObjects;

  /** @type {WeakMap<HTMLMediaElement, EventListener>} Cleanup listener per transient audio. */
  transientCleanupListeners;

  /**
   * Creates an empty audio registry.
   *
   * @param {boolean} [isMuted=false] Initial mute state for registered audio.
   */
  constructor(isMuted = false) {
    this.isMuted = isMuted;
    this.audioObjects = new Set();
    this.transientAudioObjects = new Set();
    this.transientCleanupListeners = new WeakMap();
  }

  /**
   * Creates and registers a distinct audio element for the supplied source.
   *
   * @param {string} path Audio source assigned to the new element.
   * @returns {HTMLAudioElement} Newly created and registered audio element.
   */
  createAudio(path) {
    return this.register(new Audio(path));
  }

  /**
   * Creates audio that remains managed until playback ends or fails.
   *
   * @param {string} path Audio source assigned to the new element.
   * @returns {HTMLAudioElement} Newly created transient audio element.
   */
  createTransientAudio(path) {
    return this.trackTransientAudio(new Audio(path));
  }

  /**
   * Registers an existing audio element until playback ends or fails.
   *
   * @param {HTMLMediaElement} audio Audio element to manage as transient.
   * @returns {HTMLMediaElement} The same transient audio element.
   */
  trackTransientAudio(audio) {
    this.register(audio);
    if (this.transientAudioObjects.has(audio)) return audio;
    this.transientAudioObjects.add(audio);
    this.addTransientCleanupListeners(audio);
    return audio;
  }

  /**
   * Registers one-shot lifecycle listeners for transient audio.
   *
   * @param {HTMLMediaElement} audio Transient audio to release automatically.
   */
  addTransientCleanupListeners(audio) {
    const release = () => this.unregister(audio);
    this.transientCleanupListeners.set(audio, release);
    audio.addEventListener("ended", release, { once: true });
    audio.addEventListener("error", release, { once: true });
  }

  /**
   * Registers an audio element and applies the current mute state.
   *
   * @param {HTMLMediaElement} audio Audio element to manage.
   * @returns {HTMLMediaElement} The same registered audio element.
   */
  register(audio) {
    audio.muted = this.isMuted;
    this.audioObjects.add(audio);
    return audio;
  }

  /**
   * Removes one audio element from mute-state management without stopping it.
   *
   * @param {HTMLMediaElement} audio Audio element to remove from the registry.
   * @returns {boolean} Whether the audio element was registered and removed.
   */
  unregister(audio) {
    this.removeTransientCleanupListeners(audio);
    this.transientAudioObjects.delete(audio);
    return this.audioObjects.delete(audio);
  }

  /**
   * Removes lifecycle listeners associated with transient audio.
   *
   * @param {HTMLMediaElement} audio Audio whose listeners should be removed.
   */
  removeTransientCleanupListeners(audio) {
    const release = this.transientCleanupListeners.get(audio);
    if (!release) return;
    audio.removeEventListener("ended", release);
    audio.removeEventListener("error", release);
    this.transientCleanupListeners.delete(audio);
  }

  /** Stops, resets and deregisters every unfinished transient audio element. */
  stopTransientAudio() {
    [...this.transientAudioObjects].forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
      this.unregister(audio);
    });
  }

  /**
   * Applies a mute state to the manager and every registered audio element.
   *
   * @param {boolean} muted Whether registered audio should be muted.
   */
  setMuted(muted) {
    this.isMuted = muted;
    this.audioObjects.forEach((audio) => {
      audio.muted = muted;
    });
  }
}
