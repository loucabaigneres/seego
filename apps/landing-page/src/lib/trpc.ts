import { createTRPCClient, httpBatchLink } from '@trpc/client';
// Only the AppRouter *type* is imported, so no server code is bundled into the client.
import type { AppRouter } from '@seego/api/src/trpc/router';
import { env } from '../env';

/**
 * Vanilla, fully-typed tRPC client. The landing page only needs a single public
 * mutation, so it skips the React Query integration used by `apps/web`.
 */
export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.VITE_API_URL}/trpc`,
    }),
  ],
});
