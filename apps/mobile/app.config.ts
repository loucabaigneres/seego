import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Extends app.json with the values that come from the environment (`.env` locally, EAS
 * environment variables in the cloud), so they are never committed.
 */
export default ({ config }: ConfigContext): ExpoConfig => ({
  // app.json always sets name and slug.
  ...(config as ExpoConfig),
  plugins: [
    ...(config.plugins ?? []),
    // Written into AndroidManifest.xml at prebuild: needs a native rebuild, ignored by Expo Go.
    // iOS keeps Apple Maps (no PROVIDER_GOOGLE), so it needs no key.
    ['react-native-maps', { androidGoogleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY }],
  ],
});
