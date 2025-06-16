import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    playing: { type: Boolean, default: false },
    percentageVisible: { type: Number, default: 20 } // percentage of video that must be visible (0-100)
  }

  connect() {
    this.#detectViewport()
  }

  disconnect() {
    this.observer?.disconnect()
  }

  // private

  #detectViewport() {
    this.observer = new IntersectionObserver(
      ([entry]) => this.#adjustPlayback(entry),
      { threshold: this.#thresholdValue }
    )

    this.observer.observe(this.element)
  }

  #adjustPlayback(entry) {
    if (!entry) return

    if (!entry.isIntersecting) {
      this.#pauseWhenOutOfView()

      return
    }

    this.#resumeIfPreviouslyPlaying()
  }

  #pauseWhenOutOfView() {
    if (this.element.paused) return

    this.element.pause()

    this.playingValue = true
  }

  #resumeIfPreviouslyPlaying() {
    if (!this.playingValue) return

    this.#attemptToPlay().catch(() => this.playingValue = false)
  }

  #attemptToPlay() {
    return this.element.play() || Promise.reject()
  }

  get #thresholdValue() {
    return this.percentageVisibleValue / 100
  }
}
