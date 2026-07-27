import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.foodrescue.app',
  appName: 'FoodRescue',
  webDir: 'out',
  android: {
    allowMixedContent: true
  },
  server: {
    cleartext: true
  }
};

export default config;
