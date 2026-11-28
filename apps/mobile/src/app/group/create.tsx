import { Redirect } from 'expo-router';

import { CreateGroupTrip } from '@/features/group-trip/components/CreateGroupTrip';
import { useAuthSession } from '@/hooks/useAuthSession';
import { LoadingState, Screen } from '@/ui';

export default function CreateGroupTripScreen() {
  const { isSignedIn, isPending } = useAuthSession();

  if (isPending) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  // Group trips need an account: the Trips tab invites guests to sign in.
  if (!isSignedIn) return <Redirect href="/trips" />;
  return <CreateGroupTrip />;
}
