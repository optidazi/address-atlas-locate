
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.51c86070b6b240d3947bfe8cd762021c',
  appName: 'address-atlas-locate',
  webDir: 'dist',
  server: {
    url: "https://51c86070-b6b2-40d3-947b-fe8cd762021c.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
