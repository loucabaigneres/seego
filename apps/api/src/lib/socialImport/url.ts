import type { Platform } from './types.js';

const TIKTOK_HOSTS = ['tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com', 'm.tiktok.com'];
const INSTAGRAM_HOSTS = ['instagram.com', 'instagr.am', 'ig.me'];

const matchesHost = (hostname: string, hosts: string[]) =>
  hosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));

/**
 * Clé de dédup d'un contenu : hôte (sans `www.`) + chemin sans slash final, query et
 * fragment retirés. Deux collages du même lien donnent la même clé.
 */
export const normalizeContentUrl = (url: string): string => {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase().replace(/^www\./, '');
    const path = u.pathname.replace(/\/+$/, '');
    return `${host}${path}`;
  } catch {
    return url.trim().toLowerCase();
  }
};

export const detectPlatform = (url: string): Platform => {
  let hostname: string;
  try {
    hostname = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return 'other';
  }

  if (matchesHost(hostname, TIKTOK_HOSTS)) return 'tiktok';
  if (matchesHost(hostname, INSTAGRAM_HOSTS)) return 'instagram';
  return 'other';
};
