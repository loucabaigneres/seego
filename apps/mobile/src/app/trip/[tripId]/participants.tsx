import { Redirect, router, useLocalSearchParams } from 'expo-router';

import { Participants } from '@/features/group-trip/components/Participants';
import { useGroupTripById } from '@/features/group-trip/hooks/useGroupTrip';
import { EmptyState, ErrorState, LoadingState, Screen } from '@/ui';
import { UsersThreeIcon } from '@/ui/icons';

export default function ParticipantsScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  if (!tripId) return <Redirect href="/trips" />;
  return <ParticipantsPage tripId={tripId} />;
}

function ParticipantsPage({ tripId }: { tripId: string }) {
  const { trip, isLoading, failed, retry, group } = useGroupTripById(tripId);

  if (trip && group.state === 'active') return <Participants trip={trip} group={group} />;

  return (
    <Screen>
      {isLoading ? (
        <LoadingState />
      ) : failed ? (
        <ErrorState title="Impossible de charger les participants" onRetry={retry} />
      ) : (
        <EmptyState
          icon={UsersThreeIcon}
          title="Pas un voyage de groupe"
          description="Ce voyage n’a pas de participants à gérer."
          action={{ label: 'Retour à mes voyages', onPress: () => router.replace('/trips') }}
        />
      )}
    </Screen>
  );
}
