/** Creates and tracks independent audio elements with a shared mute state. */
class AudioManager {
  /** @type {boolean} Mute state applied to newly registered audio. */
  isMuted;

  /** @type {Set<HTMLMediaElement>} Audio elements managed by this instance. */
  audioObjects;

  /**
   * Creates an empty audio registry.
   *
   * @param {boolean} [isMuted=false] Initial mute state for registered audio.
   */
  constructor(isMuted = false) {
    this.isMuted = isMuted;
    this.audioObjects = new Set();
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
