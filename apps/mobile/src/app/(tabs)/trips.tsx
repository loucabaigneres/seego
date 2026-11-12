import { RefreshControl } from 'react-native';

import { useProfileRefresh } from '@/features/profile/hooks/useProfileRefresh';
import { GuestInvite } from '@/features/profile/components/GuestInvite';
import { TripList } from '@/features/trips/components/TripList';
import { useAuthSession } from '@/hooks/useAuthSession';
import { colors } from '@seego/ui';
import { Screen, Skeleton, Text } from '@/ui';

export default function TripsScreen() {
  const { isSignedIn, isPending } = useAuthSession();
  const { isRefreshing, refresh } = useProfileRefresh();

  if (isPending) {
    return (
      <Screen edges={['top']} contentClassName="gap-3">
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="h-24 rounded-card" />
      </Screen>
    );
  }

  if (!isSignedIn) {
    return (
      <Screen edges={['top']}>
        <GuestInvite />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      edges={['top']}
      contentClassName="gap-6"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor={colors.brand}
          colors={[colors.brand]}
        />
      }
    >
      <Text variant="title" role="heading">
        Mes voyages
      </Text>
      <TripList />
    </Screen>
  );
}
