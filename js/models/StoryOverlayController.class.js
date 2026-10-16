/** Manages the readable story overlay without owning game lifecycle state. */
class StoryOverlayController {
  /** Makes the story button available for intro or victory text. */
  syncStoryButton({ state, victoryStory }) {
    const button = document.querySelector(".story-toggle-button");
    if (!button) return;

    button.hidden = state !== "intro" && !(state === "gameWon" && victoryStory);
  }

  /** Opens or closes the overlay for the supplied story context. */
  toggleStoryOverlay(context) {
    if (!this.canToggle(context)) return;

    const overlay = document.getElementById("story-overlay");
    if (!overlay) return;
    this.setStoryOverlayVisible({ ...context, visible: overlay.hidden });
  }

  /** Updates overlay content, visibility, accessibility and focus. */
  setStoryOverlayVisible({ visible, state, introStory, victoryStory }) {
    const overlay = document.getElementById("story-overlay");
    if (!overlay) return;

    const source = this.getStorySource(state, introStory, victoryStory);
    if (visible && !source) return;
    if (visible) this.renderStory(overlay, state, source);
    this.updateOverlayState(overlay, visible);
  }

  /** Returns whether the current lifecycle state supports the overlay. */
  canToggle({ state }) {
    return state === "intro" || state === "gameWon";
  }

  /** Selects the story belonging to the supplied lifecycle state. */
  getStorySource(state, introStory, victoryStory) {
    if (state === "intro") return introStory;
    if (state === "gameWon") return victoryStory;
    return null;
  }

  /** Renders title, paragraphs and hint for the active story. */
  renderStory(overlay, state, source) {
    const title = document.getElementById("story-overlay-title");
    const body = document.getElementById("story-overlay-body");
    title.textContent = this.getTitle(state);
    body.replaceChildren();
    state === "intro"
      ? this.renderIntroStory(body)
      : this.renderVictoryStory(body, source);
    this.updateHint(overlay, state);
  }

  /** Returns the title used for the active story. */
  getTitle(state) {
    return state === "intro"
      ? "The Grumpy Spirit of the Woods"
      : "Peace returns to the forest";
  }

  /** Renders the fixed intro story paragraphs. */
  renderIntroStory(body) {
    const message = [
      "This is the spell of the grumpy spirit of the woods!",
      "It brings you deeper insights when life gets complicated.",
      "Press it again to return to normal life.",
    ];
    message.forEach((line) => this.appendParagraph(body, line));
  }

  /** Renders victory text in groups of three sentences per paragraph. */
  renderVictoryStory(body, source) {
    const sentences = source.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [source.text];
    for (let i = 0; i < sentences.length; i += 3) {
      this.appendParagraph(body, sentences.slice(i, i + 3).join(" ").trim());
    }
  }

  /** Adds one text paragraph to the story body. */
  appendParagraph(body, text) {
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    body.appendChild(paragraph);
  }

  /** Updates the contextual instruction below the story. */
  updateHint(overlay, state) {
    const hint = overlay.querySelector(".story-overlay-hint");
    if (hint) {
      hint.textContent = state === "intro"
        ? "Press Enter to start the game."
        : "Press Enter to restart.";
    }
  }

  /** Applies visibility, ARIA state and focus to the overlay. */
  updateOverlayState(overlay, visible) {
    const button = document.querySelector(".story-toggle-button");
    overlay.hidden = !visible;
    button?.setAttribute("aria-expanded", String(visible));
    button?.setAttribute(
      "aria-label",
      visible ? "Return to animated scrolling text" : "Read story without scrolling",
    );
    if (visible) {
      overlay.querySelector(".story-overlay-content")?.focus({ preventScroll: true });
    }
  }
}
