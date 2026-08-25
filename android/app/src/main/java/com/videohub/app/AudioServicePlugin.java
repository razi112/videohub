package com.videohub.app;

import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Capacitor bridge plugin that lets JavaScript start and stop the
 * AudioForegroundService.
 *
 * JS usage:
 *   import { registerPlugin } from '@capacitor/core';
 *   const AudioService = registerPlugin('AudioService');
 *
 *   AudioService.start({ title: 'Track name', artist: 'Channel name' });
 *   AudioService.stop();
 */
@CapacitorPlugin(name = "AudioService")
public class AudioServicePlugin extends Plugin {

    /**
     * Start the foreground service.
     * Accepted call options (all optional):
     *   title  – track/video title shown in the notification
     *   artist – channel / artist name shown in the notification
     */
    @PluginMethod
    public void start(PluginCall call) {
        String title  = call.getString("title",  "Now Playing");
        String artist = call.getString("artist", "VideoHub");

        Intent intent = new Intent(getContext(), AudioForegroundService.class);
        intent.setAction(AudioForegroundService.ACTION_START);
        intent.putExtra(AudioForegroundService.EXTRA_TITLE,  title);
        intent.putExtra(AudioForegroundService.EXTRA_ARTIST, artist);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getContext().startForegroundService(intent);
        } else {
            getContext().startService(intent);
        }

        call.resolve();
    }

    /**
     * Stop the foreground service and dismiss the notification.
     */
    @PluginMethod
    public void stop(PluginCall call) {
        Intent intent = new Intent(getContext(), AudioForegroundService.class);
        intent.setAction(AudioForegroundService.ACTION_STOP);
        getContext().startService(intent);

        call.resolve();
    }
}
