import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aswora.ai',
  appName: 'Aswora AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1800,
      launchAutoHide: true,
      backgroundColor: '#0a0d14',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK' as any,
      backgroundColor: '#0a0d14',
    },
    Keyboard: {
      resize: 'body' as any,
      style: 'DARK' as any,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
