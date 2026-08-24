/**
 * Shared YouTube IFrame API loader.
 * Guarantees `window.YT.Player` is ready before resolving,
 * even if called from multiple components simultaneously.
 */

const listeners: Array<() => void> = []
let state: 'idle' | 'loading' | 'ready' = 'idle'

export function loadYTApi(): Promise<void> {
  if (state === 'ready' && window.YT?.Player) return Promise.resolve()

  return new Promise<void>(resolve => {
    listeners.push(resolve)

    if (state === 'loading') return // already loading — just queued the resolver

    state = 'loading'

    // If the API somehow already loaded (e.g. hot-reload), flush immediately
    if (window.YT?.Player) {
      flush()
      return
    }

    // Inject script once
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    document.head.appendChild(script)

    window.onYouTubeIframeAPIReady = flush
  })
}

function flush() {
  state = 'ready'
  listeners.splice(0).forEach(fn => fn())
}
