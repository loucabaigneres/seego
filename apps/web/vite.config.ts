import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      routesDirectory: './src/app/routes',
      generatedRouteTree: './src/app/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true, // Exit if the port is already in use
    // Local mirror of the Vercel proxy (api/proxy.ts), used with VITE_USE_API_PROXY=true: the
    // front calls /api on its own origin, so the session cookie is first-party. Needed to test
    // Sign in with Apple through an HTTPS tunnel (see "Sign in with Apple" in apps/api/README.md).
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://localhost:3000',
        // /api/auth/* -> /api/auth/* (Better Auth); /api/<other> -> /<other> (trpc, ...)
        rewrite: (path) => (path.startsWith('/api/auth/') ? path : path.replace(/^\/api/, '')),
        xfwd: true,
      },
    },
    // Quick HTTPS tunnels (`cloudflared tunnel --url http://localhost:5173`).
    allowedHosts: ['.trycloudflare.com'],
  },
  preview: {
    port: 5173,
    strictPort: true, // Exit if the port is already in use
  },
});
