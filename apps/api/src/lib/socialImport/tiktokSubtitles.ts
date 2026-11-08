import { BROWSER_USER_AGENT, FETCH_TIMEOUT_MS } from './http.js';

/** Convertit un fichier WebVTT en texte brut (sans horodatages ni balises, dédupliqué). */
const vttToText = (vtt: string): string => {
  const lines: string[] = [];
  for (const raw of vtt.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line === 'WEBVTT' || line.includes('-->') || /^\d+$/.test(line)) continue;
    const clean = line.replace(/<[^>]+>/g, '').trim();
    // On ignore les répétitions consécutives fréquentes dans les sous-titres ASR.
    if (clean && lines[lines.length - 1] !== clean) lines.push(clean);
  }
  const text = lines.join(' ');
  return text.length > 4000 ? text.slice(0, 4000) : text;
};

interface TikTokSubtitleInfo {
  LanguageCodeName?: string;
  Url?: string;
}

/**
 * Récupère la transcription (sous-titres auto-générés) d'une vidéo TikTok via le JSON
 * embarqué de la page. Best-effort : `null` si la page ou la piste n'est pas disponible.
 * Préfère le français, sinon la première piste.
 */
export const fetchTikTokSubtitles = async (canonicalUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(canonicalUrl, {
      headers: { 'User-Agent': BROWSER_USER_AGENT, 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8' },
      redirect: 'follow',
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;

    const html = await response.text();
    const match = html.match(
      /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__" type="application\/json">([\s\S]*?)<\/script>/,
    );
    if (!match) return null;

    const data = JSON.parse(match[1]!) as {
      __DEFAULT_SCOPE__?: {
        'webapp.video-detail'?: {
          itemInfo?: { itemStruct?: { video?: { subtitleInfos?: TikTokSubtitleInfo[] } } };
        };
      };
    };
    const subs =
      data.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct?.video?.subtitleInfos;
    if (!Array.isArray(subs) || subs.length === 0) return null;

    const track = subs.find((s) => /^fr/i.test(s.LanguageCodeName ?? '')) ?? subs[0];
    if (!track?.Url) return null;

    const vttResponse = await fetch(track.Url, {
      headers: { 'User-Agent': BROWSER_USER_AGENT, Referer: 'https://www.tiktok.com/' },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!vttResponse.ok) return null;

    return vttToText(await vttResponse.text()) || null;
  } catch {
    return null;
  }
};
