import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.videohub.app',
  appName: 'videohub',
  webDir: 'dist',
  server: {
    // Required for Android: serve assets over https so fetch() to Supabase works
    androidScheme: 'https',
  },
};

export default config;
