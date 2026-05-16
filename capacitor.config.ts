import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tapdone.app',
  appName: 'TapDone',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    AdMob: {
      // Dummy IDs for development/testing
      // In production, these should be replaced with real IDs
      androidBannerId: 'ca-app-pub-3940256099942544/6300978111',
      androidInterstitialId: 'ca-app-pub-3940256099942544/1033173712',
      androidRewardedId: 'ca-app-pub-3940256099942544/5224354917'
    }
  }
};

export default config;
