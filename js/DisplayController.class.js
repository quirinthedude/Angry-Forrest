class DisplayController {
  constructor() {
    document.addEventListener("fullscreenchange", () =>
      this.handleViewportChange(),
    );

    window.addEventListener("resize", () => this.handleViewportChange());

    window.addEventListener("orientationchange", () =>
      this.handleViewportChange(),
    );
  }
}
