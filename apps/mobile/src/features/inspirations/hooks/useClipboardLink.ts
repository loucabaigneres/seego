import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';

import { clipboardSuggestion, extractSupportedUrl } from '../lib/import-url';

/** Links already suggested this session, so a dismissed one doesn't come back. */
const offered = new Set<string>();
// shortcut: iOS can't tell which link is copied without the paste prompt, so one "Ignorer" mutes
// the banner for the session; use the pasteboard change count if users miss later links.
let isMutedOnIos = false;

/**
 * Suggests importing a TikTok or Instagram link the user copied ("Copier le lien"), each time
 * the app comes to the foreground.
 * - Android: the clipboard is read at once (the system shows its "pasted" toast).
 * - iOS: reading would trigger the paste prompt, so we only check that *a* link is there, and
 *   read it when the user taps "Importer".
 */
export function useClipboardLink({ enabled }: { enabled: boolean }) {
  const [suggestion, setSuggestion] = useState<
    { kind: 'link'; url: string } | { kind: 'unknown' } | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || Platform.OS === 'web') return;

    const check = async () => {
      if (Platform.OS === 'ios') {
        if (!isMutedOnIos && (await Clipboard.hasUrlAsync())) setSuggestion({ kind: 'unknown' });
        return;
      }
      const url = clipboardSuggestion(await Clipboard.getStringAsync(), offered);
      if (url) setSuggestion({ kind: 'link', url });
    };

    check().catch(() => undefined);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') check().catch(() => undefined);
    });
    return () => subscription.remove();
  }, [enabled]);

  const dismiss = () => {
    if (suggestion?.kind === 'link') offered.add(suggestion.url);
    else isMutedOnIos = true;
    setSuggestion(null);
    setError(null);
  };

  const open = (url: string) => {
    offered.add(url);
    isMutedOnIos = true;
    setSuggestion(null);
    setError(null);
    router.push({ pathname: '/inspiration/import', params: { url } });
  };

  return {
    /** Something to suggest: a known link (Android) or "a link" to read on tap (iOS). */
    suggestion,
    error,
    dismiss,
    importLink: async () => {
      if (suggestion?.kind === 'link') return open(suggestion.url);
      const url = extractSupportedUrl(await Clipboard.getStringAsync());
      if (url) return open(url);
      setError('Le lien copié n’est pas une vidéo TikTok ou Instagram.');
    },
  };
}
