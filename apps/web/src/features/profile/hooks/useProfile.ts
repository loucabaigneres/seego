import { useRequireSession } from '@/hooks/useRequireSession';
import { resetAnalytics, track } from '@/lib/analytics';
import { authClient } from '@/lib/auth-client';
import { trpc } from '@/lib/trpc';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

/** Signed-in user's profile, stats and trips. Signed-out visitors are sent to the login page. */
export function useProfile() {
  const navigate = useNavigate();
  const { session, isPending: isSessionLoading } = useRequireSession();
  const isSignedIn = !!session?.user;

  const profileQuery = useQuery({
    ...trpc.user.getProfile.queryOptions(),
    enabled: isSignedIn,
  });

  const tripsQuery = useQuery({
    ...trpc.user.getTrips.queryOptions(),
    enabled: isSignedIn,
  });

  const logout = async () => {
    await authClient.signOut();
    track('logout');
    resetAnalytics();
    navigate({ to: '/discovery' });
  };

  return {
    isSignedIn,
    isLoading: isSessionLoading || profileQuery.isLoading,
    profile: profileQuery.data,
    trips: tripsQuery.data,
    isLoadingTrips: tripsQuery.isLoading,
    logout,
  };
}
