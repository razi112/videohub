import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.videohub.app',
  appName: 'videohub',
  webDir: 'dist',
  server: {
    // Serve web assets over HTTPS so same-origin fetch() calls work on Android
    androidScheme: 'https',
  },
  plugins: {
    // CapacitorHttp patches the global fetch() and XMLHttpRequest in the WebView
    // to route all network calls through Android's native HttpURLConnection.
    // This bypasses WebView-level CORS/fetch restrictions that cause
    // "TypeError: Failed to fetch" on Android when calling Supabase.
    CapacitorHttp: {
      enabled: true,
    },
  },
};

export default config;
