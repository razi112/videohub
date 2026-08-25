/* ── Shared YouTube IFrame API global types ─────────────────────────── */

interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  stopVideo(): void
  loadVideoById(id: string): void
  cueVideoById(id: string): void
  getCurrentTime(): number
  getDuration(): number
  seekTo(seconds: number, allowSeekAhead: boolean): void
  getPlayerState(): number
  mute(): void
  unMute(): void
  isMuted(): boolean
  destroy(): void
}

interface Window {
  YT: {
    Player: new (
      el: HTMLElement | string,
      opts: {
        videoId: string
        playerVars?: Record<string, number | string>
        events?: {
          onReady?: (e: { target: YTPlayer }) => void
          onStateChange?: (e: { data: number }) => void
          onError?: (e: { data: number }) => void
        }
      }
    ) => YTPlayer
    PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number }
  }
  onYouTubeIframeAPIReady: () => void
}
