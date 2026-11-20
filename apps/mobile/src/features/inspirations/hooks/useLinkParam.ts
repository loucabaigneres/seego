import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

/** Hands over a link passed as `?url=` (e.g. from the clipboard banner), once. */
export function useLinkParam(onLink: (text: string) => void) {
  const { url } = useLocalSearchParams<{ url?: string }>();

  useEffect(() => {
    if (!url) return;
    onLink(url);
    router.setParams({ url: undefined });
    // Fires per new link; `onLink` changes on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);
}
