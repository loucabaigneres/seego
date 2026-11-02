import { useQuery } from '@tanstack/react-query';

import { trpc } from '@/lib/trpc';

export function useDiscoveryFeed() {
  const query = useQuery({
    ...trpc.discovery.feed.queryOptions(),
    // The server shuffles the feed on every call: one shuffle per visit, never refetched
    // in the background, or the cards still to come would change order mid-session.
    staleTime: Infinity,
    gcTime: 0,
  });

  return {
    places: query.data,
    hasFailed: query.isError,
    retry: () => query.refetch(),
  };
}
