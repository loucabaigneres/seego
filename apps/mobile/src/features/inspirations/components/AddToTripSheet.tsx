import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { pluralize } from '@/domain/date';
import { tripMonogram, tripPickerDetails } from '@/domain/trip-summary';
import { colors } from '@seego/ui';
import { Button, cn, EmptyState, ErrorState, Notice, Sheet, Skeleton, Text } from '@/ui';
import { CheckCircleIcon, SuitcaseRollingIcon } from '@/ui/icons';

import { useAddToTrip } from '../hooks/useAddToTrip';
import { addedPlacesLabel, platformLabel, tripLabel } from '../lib/inspiration';

/** Tile colours of trips without a photo, cycled down the list. */
const TILE_TONES = [
  { tile: 'bg-accent', text: 'text-brand' },
  { tile: 'bg-success', text: 'text-ink-inverse' },
  { tile: 'bg-surface', text: 'text-brand' },
];

export interface AddToTripSheetProps {
  /** The inspiration whose places are added; `null` closes the sheet. */
  inspiration: { id: string; platform: string | null; extractedPlaces: unknown[] } | null;
  onClose: () => void;
}

/** "Ajouter à un voyage": pick one of the user's trips, add the places, then open the trip. */
export function AddToTripSheet({ inspiration, onClose }: AddToTripSheetProps) {
  const adding = useAddToTrip(inspiration?.id ?? null);
  const close = () => {
    adding.reset();
    onClose();
  };
  const placeCount = inspiration?.extractedPlaces.length ?? 0;
  const source = inspiration && platformLabel(inspiration.platform);

  return (
    <Sheet
      visible={inspiration !== null}
      onClose={close}
      title="Ajouter à un voyage"
      subtitle={
        source
          ? `${pluralize(placeCount, 'lieu repéré', 'lieux repérés')} dans ce ${source === 'Lien' ? 'lien' : source}`
          : undefined
      }
    >
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
          <Skeleton className="h-16 rounded-field" />
          <Skeleton className="h-16 rounded-field" />
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
            {adding.trips.map((trip, index) => {
              const isPicked = trip.id === adding.tripId;
              const tone = TILE_TONES[index % TILE_TONES.length];
              return (
                <Pressable
                  key={trip.id}
                  role="radio"
                  aria-checked={isPicked}
                  onPress={() => adding.pickTrip(trip.id)}
                  disabled={adding.isAdding}
                  className={cn(
                    'flex-row items-center gap-3 rounded-field border-[1.5px] py-2.5 pl-2.5 pr-3.5 active:opacity-80',
                    isPicked ? 'border-brand bg-background' : 'border-transparent bg-surface',
                  )}
                >
                  <View
                    aria-hidden
                    className={cn(
                      'size-11 items-center justify-center overflow-hidden rounded-[10px]',
                      tone.tile,
                    )}
                  >
                    {trip.coverImage ? (
                      <Image
                        source={trip.coverImage}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                      />
                    ) : (
                      <Text variant="section" className={cn('text-[19px] leading-6', tone.text)}>
                        {tripMonogram(trip)}
                      </Text>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text variant="label" numberOfLines={1}>
                      {tripLabel(trip)}
                    </Text>
                    <Text variant="caption" numberOfLines={1}>
                      {tripPickerDetails(trip)}
                    </Text>
                  </View>
                  {isPicked ? (
                    <CheckCircleIcon size={24} weight="fill" color={colors.brand} />
                  ) : (
                    <View className="size-[22px] rounded-full border-[1.5px] border-ink-muted" />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
          <Text variant="caption">
            Les lieux s’ajoutent à tes coups de cœur : tu les places ensuite dans ton planning.
          </Text>
          {adding.addFailed && (
            <Notice message="Impossible d’ajouter ces lieux pour le moment. Réessaie." />
          )}
          <Button
            label={placeCount > 1 ? `Ajouter les ${placeCount} lieux` : 'Ajouter au voyage'}
            variant="cta"
            loading={adding.isAdding}
            onPress={adding.add}
          />
        </View>
      )}
    </Sheet>
  );
}
