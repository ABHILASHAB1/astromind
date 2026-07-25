import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.astromind.app',
  appName: 'AstroMind',
  webDir: 'public',
  server: {
    url: 'https://astromind-neon.vercel.app',
    cleartext: true
  }
};

export default config;
