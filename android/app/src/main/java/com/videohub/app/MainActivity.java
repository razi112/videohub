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
     * Normally BridgeActivity.onPause() calls WebView.onPause(), which
     * suspends JavaScript execution — killing the YouTube IFrame player.
     * We skip that call so the WebView (and any playing audio) keeps running
     * while the app is in the background.
     *
     * The foreground service notification satisfies Android's requirement
     * that background work is visible to the user.
     */
    @Override
    public void onPause() {
        // Intentionally do NOT call super.onPause() so the WebView is not paused.
        // We still notify the Capacitor bridge about the lifecycle event.
        getBridge().getApp().fireAppStateChange(false);
    }

    @Override
    public void onResume() {
        super.onResume();
        // Re-notify the bridge that the app is active again
        getBridge().getApp().fireAppStateChange(true);
    }

    @Override
    public void onStop() {
        // Do NOT call super.onStop() — that would also pause the WebView.
        // The foreground service keeps the process alive.
    }
}
