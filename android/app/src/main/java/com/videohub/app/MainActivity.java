package com.videohub.app;

import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onStart() {
        super.onStart();
        // Register our custom plugin so JS can call AudioService.start() / stop()
        registerPlugin(AudioServicePlugin.class);
    }

    /**
     * Normally BridgeActivity.onPause() calls super.onPause() which lets the Android
     * system suspend the WebView, killing JavaScript execution and the YouTube IFrame player.
     *
     * We skip super.onPause() so the WebView keeps running in the background, while still
     * notifying Capacitor plugins of the lifecycle event via bridge.onPause().
     *
     * Note: fireStatusChange(false) is intentionally NOT called here — Capacitor fires it
     * in onStop() (when activityDepth reaches 0), matching the framework's own pattern.
     *
     * The foreground service notification satisfies Android's requirement that background
     * work is visible to the user.
     */
    @Override
    public void onPause() {
        // Skip super.onPause() to prevent the system from pausing the WebView.
        // Still notify plugins of the pause event.
        if (getBridge() != null) {
            getBridge().onPause();
        }
    }

    @Override
    public void onResume() {
        super.onResume();
        // super.onResume() already calls bridge.getApp().fireStatusChange(true)
        // and bridge.onResume() — nothing extra needed here.
    }

    @Override
    public void onStop() {
        // Skip super.onStop() to prevent the WebView from being fully stopped.
        // Still notify plugins and fire the app status change so Capacitor's
        // App plugin correctly reports the app as inactive.
        if (getBridge() != null) {
            getBridge().getApp().fireStatusChange(false);
            getBridge().onStop();
        }
    }
}
