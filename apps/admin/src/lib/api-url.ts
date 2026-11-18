import { env } from '@/config/env';

// En prod, le front passera par un proxy Vercel (`/api/*`, comme apps/web/api/[...path].ts) pour que
// le cookie de session soit first-party (Safari bloque les cookies cross-site de l'API).
// En local, on appelle directement l'API (VITE_API_URL).
const useProxy = env.VITE_USE_API_PROXY;

/** Racine pour le client Better Auth (il ajoute lui-même `/api/auth`). */
export const authBaseUrl = useProxy ? window.location.origin : env.VITE_API_URL;

/** URL de base des endpoints non-auth de l'API (trpc, image-proxy, ...). */
export const apiBaseUrl = useProxy ? '/api' : env.VITE_API_URL;
