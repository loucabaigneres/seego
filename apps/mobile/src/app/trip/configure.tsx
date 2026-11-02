import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { TripConfigForm } from '@/features/trip-config/components/TripConfigForm';
import { useTripConfig } from '@/features/trip-config/hooks/useTripConfig';
import { EmptyState, ErrorState, LoadingState, Screen } from '@/ui';
import { MapTrifoldIcon } from '@/ui/icons';

export default function TripConfigureScreen() {
  const { tripId } = useLocalSearchParams<{ tripId?: string }>();
  // The form completes a trip from the swipe flow: without one, that flow comes first.
  if (!tripId) return <Redirect href="/onboarding" />;
  return <TripConfiguration tripId={tripId} />;
}

function TripConfiguration({ tripId }: { tripId: string }) {
  const config = useTripConfig(tripId);

  if (config.isLoading || config.loadFailed || !config.destination) {
    return (
      <Screen>
        {config.isLoading ? (
          <LoadingState />
        ) : config.loadFailed ? (
          <ErrorState title="Impossible de charger ton voyage" onRetry={config.retryLoad} />
        ) : (
          <EmptyState
            icon={MapTrifoldIcon}
            title="Pas encore de destination"
            description="Swipe quelques lieux pour trouver la ville qui te correspond."
            action={{
              label: 'Choisir une destination',
              onPress: () => router.replace({ pathname: '/discovery', params: { tripId } }),
            }}
          />
        )}
      </Screen>
    );
  }

  return (
    <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Screen contentClassName="gap-6 px-0 pb-2">
        <TripConfigForm config={config} destination={config.destination} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
