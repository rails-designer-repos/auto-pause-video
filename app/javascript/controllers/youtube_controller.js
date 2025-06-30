import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["player"]

  static values = {
    playing: { type: Boolean, default: false },
    percentageVisible: { type: Number, default: 20 } // percentage of video that must be visible (0-100)
  }

  connect() {
    this.#setup()
  }

  disconnect() {
    this.observer?.disconnect()
  }

  // private

  #setup() {
    if (window.YT) {
      this.#createPlayer()

      return
    }

    window.onYouTubeIframeAPIReady = () => this.#createPlayer()

    const tag = document.createElement("script")
    tag.src = "https://www.youtube.com/iframe_api"

    document.head.appendChild(tag)
  }

  #createPlayer() {
    if (!this.playerTarget) return

    this.player = new YT.Player(this.playerTarget, {
      events: {
        "onReady": () => this.#detectViewport(),
        "onStateChange": (event) => {
          if (event.data !== YT.PlayerState.PLAYING) return

          this.playingValue = false
        }
      }
    })
  }

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
    if (!this.player || this.player.getPlayerState() !== YT.PlayerState.PLAYING) return

    this.player.pauseVideo()

    this.playingValue = true
  }

  #resumeIfPreviouslyPlaying() {
    if (!this.playingValue) return

    this.#attemptToPlay()
  }

  #attemptToPlay() {
    if (!this.player) return

    this.player.playVideo()

    this.playingValue = false
  }

  get #thresholdValue() {
    return this.percentageVisibleValue / 100
  }
}
