import { BROWSER_USER_AGENT, FETCH_TIMEOUT_MS } from './http.js';

/** Taille maximale d'une image d'aperçu relayée vers l'IA. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/**
 * Télécharge une image d'aperçu et la renvoie encodée en base64, prête à être
 * envoyée à Gemini en `inlineData`. Best-effort : renvoie `null` (sans lever) si
 * la ressource est inaccessible, n'est pas une image, ou dépasse la taille limite.
 */
export const downloadImageAsInline = async (
  rawUrl: string,
): Promise<{ mimeType: string; data: string } | null> => {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null;

  try {
    const response = await fetch(rawUrl, {
      headers: { 'User-Agent': BROWSER_USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: 'follow',
    });

    if (!response.ok) return null;

    const mimeType = response.headers.get('content-type')?.split(';')[0]?.trim() ?? '';
    if (!mimeType.startsWith('image/')) return null;

    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.byteLength === 0 || buffer.byteLength > MAX_IMAGE_BYTES) return null;

    return { mimeType, data: buffer.toString('base64') };
  } catch {
    return null;
  }
};
