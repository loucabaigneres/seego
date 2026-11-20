import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useRef, useState } from 'react';

import { trpc } from '@/lib/trpc';

import { importErrorState } from '../lib/import-errors';
import { extractSupportedUrl, importUrlError } from '../lib/import-url';

/**
 * The import form: link, optional caption, AI analysis and its errors.
 * A shared link is analysed as soon as `canAnalyze` (signed in) is true, even after a sign-in.
 */
export function useImportInspiration({ canAnalyze }: { canAnalyze: boolean }) {
  const queryClient = useQueryClient();
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [showCaption, setShowCaption] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** A link was shared while signed out: analyse it once the user signs in. */
  const pendingShare = useRef(false);

  const mutation = useMutation(
    trpc.inspiration.analyzeFromUrl.mutationOptions({
      onSuccess: () => {
        setError(null);
        setShowCaption(false);
        setCaption('');
        queryClient.invalidateQueries({ queryKey: trpc.inspiration.listMine.queryKey() });
      },
      onError: (failure) => {
        const state = importErrorState(failure.message);
        setError(state.message);
        if (state.needsCaption) setShowCaption(true);
      },
    }),
  );

  const analyze = (text = url) => {
    const invalid = importUrlError(text);
    if (invalid) {
      setError(invalid);
      return;
    }
    const link = extractSupportedUrl(text)!;
    setUrl(link);
    setError(null);
    mutation.mutate({ url: link, caption: caption.trim() || undefined });
  };

  useEffect(() => {
    if (!pendingShare.current || !canAnalyze) return;
    pendingShare.current = false;
    analyze();
    // Runs on sign-in only; `analyze` reads the url typed or shared meanwhile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAnalyze]);

  return {
    url,
    setUrl,
    caption,
    setCaption,
    showCaption,
    openCaption: () => setShowCaption(true),
    error,
    isAnalyzing: mutation.isPending,
    result: mutation.data,
    analyze: () => analyze(),
    paste: async () => {
      const text = await Clipboard.getStringAsync();
      setUrl(extractSupportedUrl(text) ?? text.trim());
    },
    /** A link shared from another app: prefilled, then analysed automatically. */
    receiveSharedLink: (text: string) => {
      mutation.reset();
      if (canAnalyze) return analyze(text);
      setUrl(extractSupportedUrl(text) ?? text.trim());
      pendingShare.current = true;
    },
    reset: () => {
      mutation.reset();
      setUrl('');
      setCaption('');
      setShowCaption(false);
      setError(null);
    },
  };
}

export type ImportForm = ReturnType<typeof useImportInspiration>;
