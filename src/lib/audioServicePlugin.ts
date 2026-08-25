import { registerPlugin } from '@capacitor/core'

export interface AudioServicePlugin {
  /** Start the Android foreground service (no-op on web/iOS). */
  start(options: { title?: string; artist?: string }): Promise<void>
  /** Stop the Android foreground service (no-op on web/iOS). */
  stop(): Promise<void>
}

/**
 * Thin bridge to the native AudioServicePlugin.
 * On web and iOS the plugin is not registered, so calls resolve silently
 * because Capacitor returns an empty stub for unknown plugins on those
 * platforms.
 */
const AudioService = registerPlugin<AudioServicePlugin>('AudioService')

export default AudioService
