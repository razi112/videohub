package com.videohub.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.IBinder;
import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

/**
 * A foreground service that posts a persistent media-style notification while
 * audio is playing.  This prevents Android from suspending the WebView process
 * and keeps the YouTube IFrame Player running in the background.
 */
public class AudioForegroundService extends Service {

    public static final String ACTION_START = "com.videohub.app.AUDIO_START";
    public static final String ACTION_STOP  = "com.videohub.app.AUDIO_STOP";

    private static final String CHANNEL_ID   = "videohub_audio_channel";
    private static final String CHANNEL_NAME = "Audio Playback";
    private static final int    NOTIF_ID     = 1001;

    // ── Extras passed from the plugin ──────────────────────────────────────
    public static final String EXTRA_TITLE  = "track_title";
    public static final String EXTRA_ARTIST = "track_artist";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) return START_NOT_STICKY;

        if (ACTION_STOP.equals(intent.getAction())) {
            stopForeground(true);
            stopSelf();
            return START_NOT_STICKY;
        }

        // ACTION_START (or any other intent) → show notification
        String title  = intent.getStringExtra(EXTRA_TITLE);
        String artist = intent.getStringExtra(EXTRA_ARTIST);
        if (title  == null || title.isEmpty())  title  = "Now Playing";
        if (artist == null || artist.isEmpty()) artist = "VideoHub";

        ensureChannel();
        startForeground(NOTIF_ID, buildNotification(title, artist));
        return START_STICKY;
    }

    // ── Nothing to bind to ──────────────────────────────────────────────────
    @Nullable
    @Override
    public IBinder onBind(Intent intent) { return null; }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private void ensureChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel ch = new NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW   // silent, no sound/vibration
            );
            ch.setDescription("Shows while audio is playing in the background");
            ch.setShowBadge(false);
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(ch);
        }
    }

    private Notification buildNotification(String title, String artist) {
        // Tap the notification → reopen the app
        Intent launchIntent = getPackageManager()
            .getLaunchIntentForPackage(getPackageName());
        PendingIntent pi = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(artist)
            .setSmallIcon(android.R.drawable.ic_media_play)
            .setContentIntent(pi)
            .setOngoing(true)           // cannot be dismissed by the user
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            // Mark this as a media-playback notification so Android
            // gives it special treatment and won't kill the process.
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .build();
    }
}
