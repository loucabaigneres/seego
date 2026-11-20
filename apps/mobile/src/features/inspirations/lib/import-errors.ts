// shortcut: codes duplicated from apps/api/src/lib/inspiration/errors.ts, move to the shared package (step 11).
const CAPTION_UNAVAILABLE = 'CAPTION_UNAVAILABLE';
const AI_UNAVAILABLE = 'AI_UNAVAILABLE';

export interface ImportErrorState {
  message: string;
  /** The post couldn't be read: the user has to paste its caption. */
  needsCaption: boolean;
}

/** What to show for an `inspiration.analyzeFromUrl` error (the API carries codes in the message). */
export function importErrorState(message: string | undefined): ImportErrorState {
  if (message === CAPTION_UNAVAILABLE) {
    return {
      message:
        'Impossible de récupérer le contenu automatiquement. Colle la description ci-dessous pour lancer l’analyse.',
      needsCaption: true,
    };
  }
  if (message === AI_UNAVAILABLE) {
    return { message: 'L’analyse n’est pas disponible pour le moment.', needsCaption: false };
  }
  return { message: message?.trim() || 'L’analyse a échoué, réessaie.', needsCaption: false };
}
