import { View } from 'react-native';

import { pluralize } from '@/domain/date';
import { colors } from '@seego/ui';
import { Button, Notice, Tag, Text } from '@/ui';
import { HeartIcon, SparkleIcon } from '@/ui/icons';

import type { TripActivity } from '../hooks/useTrip';

export interface GenerateItineraryCardProps {
  likedPlaces: TripActivity[];
  isPending: boolean;
  failed: boolean;
  onGenerate: () => void;
  /** With no liked place yet (a new group trip), there is nothing to plan: swipe first. */
  onPickPlaces: () => void;
}

/** Shown until the trip has an itinerary: the liked places, and the button that plans them. */
export function GenerateItineraryCard({
  likedPlaces,
  isPending,
  failed,
  onGenerate,
  onPickPlaces,
}: GenerateItineraryCardProps) {
  if (likedPlaces.length === 0) {
    return (
      <View className="gap-5">
        <View className="gap-1.5">
          <Text variant="overline">Ton planning</Text>
          <Text variant="section" role="heading">
            Aucun lieu pour l’instant
          </Text>
          <Text tone="secondary">
            Swipe des destinations pour choisir les lieux de ce voyage, puis on les organise jour par
            jour.
          </Text>
        </View>
        <Button
          label="Choisir mes lieux"
          variant="cta"
          leading={<HeartIcon size={20} weight="fill" color={colors.ink.DEFAULT} />}
          onPress={onPickPlaces}
        />
      </View>
    );
  }

  return (
    <View className="gap-5">
      <View className="gap-1.5">
        <Text variant="overline">Ton planning</Text>
        <Text variant="section" role="heading">
          {pluralize(likedPlaces.length, 'lieu à organiser', 'lieux à organiser')}
        </Text>
        <Text tone="secondary">
          On les range jour par jour, en limitant les trajets entre deux étapes.
        </Text>
      </View>

      <View className="flex-row flex-wrap gap-1.5">
        {likedPlaces.map((place) => (
          <Tag key={place.id} label={place.title} capitalize={false} />
        ))}
      </View>

      <View className="gap-2">
        <Button
          label={isPending ? 'Génération en cours…' : 'Générer mon itinéraire'}
          variant="cta"
          leading={<SparkleIcon size={20} weight="fill" color={colors.ink.DEFAULT} />}
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
      </View>
    </View>
  );
}
