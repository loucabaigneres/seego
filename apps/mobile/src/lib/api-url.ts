const LOCAL_API_URL = /^(https?:\/\/)(localhost|127\.0\.0\.1)(?=[:/]|$)/;
const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

/**
 * On a phone or an emulator, `localhost` is the device itself, not the dev machine.
 * When the API URL points to localhost, it is swapped for the IP the Expo dev server
 * is reached on (`192.168.1.29:8081` → `192.168.1.29`), so one `.env` works everywhere.
 * Any other URL, a tunnel host or a missing dev server host leaves it unchanged.
 */
export function resolveApiUrl(apiUrl: string, devServerHost: string | null | undefined): string {
  const host = devServerHost?.split(':')[0];
  if (!host || !IPV4.test(host) || host === '127.0.0.1') return apiUrl;
  return apiUrl.replace(LOCAL_API_URL, `$1${host}`);
}
