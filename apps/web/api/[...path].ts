// Proxy Vercel : le navigateur appelle `https://app.seego.fr/api/*` (même site que le front),
// et cette fonction relaie vers l'API. Le cookie de session est ainsi posé en first-party,
// ce qui évite que Safari (ITP) bloque le cookie cross-site de l'API.
//
// Variable d'environnement requise (côté Vercel, pas VITE_) : API_PROXY_TARGET
// ex. https://api.seego.fr (sans slash final).
export const config = { runtime: 'edge' };

// Headers qui ne doivent pas être relayés tels quels.
const HOP_BY_HOP = [
  'host',
  'connection',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
  'content-length',
];

export default async function handler(request: Request): Promise<Response> {
  const target = process.env.API_PROXY_TARGET?.replace(/\/+$/, '');
  if (!target) {
    return new Response('API_PROXY_TARGET is not configured', { status: 500 });
  }

  const url = new URL(request.url);
  // /api/auth/* -> /api/auth/* (Better Auth) ; /api/<autre> -> /<autre> (trpc, image-proxy, ...)
  const upstreamPath = url.pathname.startsWith('/api/auth/')
    ? url.pathname
    : url.pathname.replace(/^\/api/, '');

  const headers = new Headers(request.headers);
  for (const name of HOP_BY_HOP) headers.delete(name);
  headers.set('x-forwarded-host', url.host);
  headers.set('x-forwarded-proto', url.protocol.replace(':', ''));

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const init: RequestInit & { duplex?: 'half' } = {
    method: request.method,
    headers,
    // On laisse le navigateur suivre les redirections (ex. callback OAuth).
    redirect: 'manual',
  };
  if (hasBody) {
    init.body = request.body;
    init.duplex = 'half';
  }

  const upstream = await fetch(`${target}${upstreamPath}${url.search}`, init);

  // `new Headers(upstream.headers)` conserve les Set-Cookie multiples.
  const responseHeaders = new Headers(upstream.headers);
  responseHeaders.delete('content-encoding');
  responseHeaders.delete('content-length');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}
