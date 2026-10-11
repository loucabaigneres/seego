import { createTRPCClient, httpBatchLink } from '@trpc/client';
// Only the AppRouter *type* is imported, so no server code is bundled into the client.
import type { AppRouter } from '@voyagr/api/src/trpc/router';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/**
 * Vanilla, fully-typed tRPC client. The landing page only needs a single public
 * mutation, so it skips the React Query integration used by `apps/web`.
 */
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${API_URL}/trpc`,
    }),
  ],
});
