import { useShareIntentContext } from 'expo-share-intent';
import { useEffect } from 'react';

/** Hands over what another app shared to Seego (TikTok, Instagram…), once, then clears it. */
export function useSharedLink(onLink: (text: string) => void) {
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntentContext();

  useEffect(() => {
    if (!hasShareIntent) return;
    const text = shareIntent.webUrl ?? shareIntent.text;
    if (text) onLink(text);
    resetShareIntent();
    // Fires per share; `onLink` and `resetShareIntent` change on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasShareIntent, shareIntent]);
}
