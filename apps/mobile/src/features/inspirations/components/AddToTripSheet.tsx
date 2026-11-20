import { router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { colors } from '@seego/ui';
import { Button, EmptyState, ErrorState, Notice, Sheet, Skeleton, Text } from '@/ui';
import { CheckCircleIcon, CircleIcon, SuitcaseRollingIcon } from '@/ui/icons';

import { useAddToTrip } from '../hooks/useAddToTrip';
import { addedPlacesLabel, tripLabel } from '../lib/inspiration';

export interface AddToTripSheetProps {
  /** The inspiration whose places are added; `null` closes the sheet. */
  inspirationId: string | null;
  onClose: () => void;
}

/** "Ajouter à un voyage": pick one of the user's trips, add the places, then open the trip. */
export function AddToTripSheet({ inspirationId, onClose }: AddToTripSheetProps) {
  const adding = useAddToTrip(inspirationId);
  const close = () => {
    adding.reset();
    onClose();
  };

  return (
    <Sheet visible={inspirationId !== null} onClose={close} title="Ajouter à un voyage">
      {adding.added ? (
        <View className="gap-4">
          <Notice
            tone="success"
            message={`${addedPlacesLabel(adding.added.count)} à ton voyage.`}
          />
          {adding.added.count > 0 && (
            <Button
              label="Voir le voyage"
              variant="cta"
              onPress={() => {
                const { tripId } = adding.added!;
                close();
                router.push({ pathname: '/trip/[tripId]', params: { tripId } });
              }}
            />
          )}
          <Button label="Fermer" variant="outline" onPress={close} />
        </View>
      ) : adding.isLoading ? (
        <View className="gap-2" aria-busy>
          <Skeleton className="h-14 rounded-field" />
          <Skeleton className="h-14 rounded-field" />
        </View>
      ) : adding.hasFailed ? (
        <ErrorState
          className="flex-none"
          title="Voyages indisponibles"
          message="Impossible de charger tes voyages. Vérifie ta connexion, puis on réessaie."
          onRetry={adding.retry}
        />
      ) : adding.trips.length === 0 ? (
        <EmptyState
          className="flex-none"
          icon={SuitcaseRollingIcon}
          title="Aucun voyage"
          description="Crée d’abord un voyage pour y ajouter ces lieux."
        />
      ) : (
        <View className="gap-4">
          <ScrollView className="max-h-80" contentContainerClassName="gap-2" role="radiogroup">
            {adding.trips.map((trip) => {
              const isPicked = trip.id === adding.tripId;
              const Icon = isPicked ? CheckCircleIcon : CircleIcon;
              return (
                <Pressable
                  key={trip.id}
                  role="radio"
                  aria-checked={isPicked}
                  onPress={() => adding.pickTrip(trip.id)}
                  disabled={adding.isAdding}
                  className="min-h-14 flex-row items-center gap-3 rounded-field bg-surface px-4 py-3 active:opacity-80"
                >
                  <Icon size={24} color={isPicked ? colors.brand : colors.ink.muted} />
                  <Text variant="label" numberOfLines={1} className="flex-1">
                    {tripLabel(trip)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
          {adding.addFailed && (
            <Notice message="Impossible d’ajouter ces lieux pour le moment. Réessaie." />
          )}
          <Button
            label="Ajouter au voyage"
            variant="cta"
            loading={adding.isAdding}
            onPress={adding.add}
          />
        </View>
      )}
    </Sheet>
  );
}
