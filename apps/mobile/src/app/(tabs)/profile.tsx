import { router } from 'expo-router';
import { RefreshControl, View } from 'react-native';

import { InspirationList } from '@/features/inspirations/components/InspirationList';
import { GuestInvite } from '@/features/profile/components/GuestInvite';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileSkeleton } from '@/features/profile/components/ProfileSkeleton';
import { ProfileStats } from '@/features/profile/components/ProfileStats';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { useProfileRefresh } from '@/features/profile/hooks/useProfileRefresh';
import { colors } from '@seego/ui';
import { Button, ErrorState, IconButton, Screen, Text } from '@/ui';
import { GearSixIcon, PlusIcon } from '@/ui/icons';

export default function ProfileScreen() {
  const { isSessionPending, isSignedIn, profile, isLoading, hasFailed, retry } = useProfile();
  const { isRefreshing, refresh } = useProfileRefresh();

  if (isSessionPending || isLoading) {
    return (
      <Screen edges={['top']}>
        <ProfileSkeleton />
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

  if (hasFailed || !profile?.user) {
    return (
      <Screen edges={['top']}>
        <ErrorState
          title="Profil indisponible"
          message="On n’arrive pas à charger ton profil. Vérifie ta connexion, puis on réessaie."
          onRetry={retry}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      edges={['top']}
      contentClassName="gap-6 pt-2"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor={colors.brand}
          colors={[colors.brand]}
        />
      }
    >
      <View className="-mb-2 -mr-2 flex-row justify-end">
        <IconButton label="Réglages" icon={GearSixIcon} onPress={() => router.push('/settings')} />
      </View>
      <ProfileHeader user={profile.user} />
      <ProfileStats stats={profile.stats} onPressTrips={() => router.navigate('/trips')} />
      <View className="gap-3.5">
        <View className="flex-row items-center justify-between">
          <Text variant="section" role="heading">
            Mes inspirations
          </Text>
          <Button
            label="Importer"
            variant="outline"
            size="sm"
            icon={PlusIcon}
            onPress={() => router.push('/inspiration/import')}
          />
        </View>
        <InspirationList />
      </View>
    </Screen>
  );
}
