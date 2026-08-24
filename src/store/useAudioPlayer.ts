import { create } from 'zustand'
import type { Video } from '../types'

export interface AudioPlayerState {
  // Current track
  currentVideo: Video | null
  isPlaying: boolean
  isVisible: boolean

  // Queue
  queue: Video[]
  queueIndex: number

  // Actions
  playVideo: (video: Video, queue?: Video[]) => void
  togglePlay: () => void
  close: () => void
  next: () => void
  prev: () => void
  setPlaying: (playing: boolean) => void
}

export const useAudioPlayer = create<AudioPlayerState>((set, get) => ({
  currentVideo: null,
  isPlaying: false,
  isVisible: false,
  queue: [],
  queueIndex: 0,

  playVideo: (video, queue) => {
    const q = queue ?? [video]
    const idx = q.findIndex(v => v.id === video.id)
    set({
      currentVideo: video,
      isPlaying: true,
      isVisible: true,
      queue: q,
      queueIndex: idx >= 0 ? idx : 0,
    })
  },

  togglePlay: () => set(s => ({ isPlaying: !s.isPlaying })),

  setPlaying: (playing) => set({ isPlaying: playing }),

  close: () => set({ isVisible: false, isPlaying: false, currentVideo: null }),

  next: () => {
    const { queue, queueIndex } = get()
    if (queue.length === 0) return
    const nextIdx = (queueIndex + 1) % queue.length
    set({ queueIndex: nextIdx, currentVideo: queue[nextIdx], isPlaying: true })
  },

  prev: () => {
    const { queue, queueIndex } = get()
    if (queue.length === 0) return
    const prevIdx = (queueIndex - 1 + queue.length) % queue.length
    set({ queueIndex: prevIdx, currentVideo: queue[prevIdx], isPlaying: true })
  },
}))
