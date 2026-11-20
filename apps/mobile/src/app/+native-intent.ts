import { getShareExtensionKey } from 'expo-share-intent';

/** The iOS share extension opens `seego://dataUrl=seegoShareKey…`: send it to the import screen. */
export function redirectSystemPath({ path }: { path: string; initial: boolean }) {
  try {
    if (path.includes(`dataUrl=${getShareExtensionKey()}`)) return '/inspiration/import';
    return path;
  } catch {
    return '/';
  }
}
