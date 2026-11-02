import { View } from 'react-native';

import { pluralize } from '@/domain/date';
import { Button, Card, Notice, Tag, Text } from '@/ui';
import { CompassIcon } from '@/ui/icons';

import type { TripActivity } from '../hooks/useTrip';

export interface GenerateItineraryCardProps {
  likedPlaces: TripActivity[];
  isPending: boolean;
  failed: boolean;
  onGenerate: () => void;
}

/** Shown until the trip has an itinerary: the liked places, and the button that plans them. */
export function GenerateItineraryCard({
  likedPlaces,
  isPending,
  failed,
  onGenerate,
}: GenerateItineraryCardProps) {
  return (
    <Card className="gap-4">
      <View className="gap-1.5">
        <Text variant="overline">Ton planning</Text>
        <Text tone="secondary">Organise tes lieux likés en un planning cohérent jour par jour.</Text>
      </View>

      {likedPlaces.length > 0 && (
        <View className="gap-2.5">
          <Text variant="overline">{pluralize(likedPlaces.length, 'lieu liké', 'lieux likés')}</Text>
          <View className="flex-row flex-wrap gap-2">
            {likedPlaces.map((place) => (
              <Tag key={place.id} label={place.title} capitalize={false} className="bg-surface-raised" />
            ))}
          </View>
        </View>
      )}

      <Button
        label={isPending ? 'Génération en cours…' : 'Générer mon itinéraire'}
        icon={CompassIcon}
        loading={isPending}
        onPress={onGenerate}
      />
      {isPending && (
        <Text variant="caption" className="text-center">
          Analyse de tes préférences et optimisation géographique…
        </Text>
      )}
      {failed && (
        <Notice message="Impossible de générer ton itinéraire pour le moment. Vérifie ta connexion et réessaie." />
      )}
    </Card>
  );
}
