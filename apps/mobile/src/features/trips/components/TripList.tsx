import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { tripDisplayTitle } from '@/domain/trip-summary';
import { Button, EmptyState, ErrorState, Notice, SegmentedControl, Skeleton, type Segment } from '@/ui';
import { MapTrifoldIcon, UsersThreeIcon } from '@/ui/icons';

import { useDeleteTrip } from '../hooks/useDeleteTrip';
import { useMyTrips } from '../hooks/useMyTrips';
import { TripCard } from './TripCard';

// shortcut: user.getTrips returns every trip and the list shows them 10 at a time; paginate in the API if accounts reach hundreds of trips.
const PAGE_SIZE = 10;

type Kind = 'solo' | 'group';
const KIND_SEGMENTS: readonly Segment<Kind>[] = [
  { value: 'solo', label: 'Solo' },
  { value: 'group', label: 'Groupe' },
];

export function TripList() {
  const { trips, isLoading, hasFailed, retry } = useMyTrips();
  const deletion = useDeleteTrip();
  const [kind, setKind] = useState<Kind>('solo');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const shown = trips.filter((trip) => (kind === 'group') === !!trip.groupRole);
  const hiddenCount = Math.max(shown.length - visibleCount, 0);

  if (isLoading) {
    return (
      <View className="gap-3" aria-busy>
        <Skeleton className="h-24 rounded-card" />
        <Skeleton className="h-24 rounded-card" />
      </View>
    );
  }

  if (hasFailed) {
    return (
      <ErrorState
        className="flex-none"
        title="Voyages indisponibles"
        message="Impossible de charger tes voyages. Vérifie ta connexion, puis on réessaie."
        onRetry={retry}
      />
    );
  }

  return (
    <View className="gap-3">
      <SegmentedControl
        segments={KIND_SEGMENTS}
        value={kind}
        onChange={(next) => {
          setKind(next);
          setVisibleCount(PAGE_SIZE);
        }}
      />
      {deletion.failed && (
        <Notice message="Impossible de supprimer ce voyage pour le moment. Réessaie." />
      )}
      {shown.length === 0 &&
        (kind === 'solo' ? (
          <EmptyState
            className="flex-none rounded-card border border-brand/15 bg-surface py-10"
            icon={MapTrifoldIcon}
            title="Pas encore de voyage"
            description="Lance le quiz ou swipe quelques destinations pour créer ton premier itinéraire."
            action={{ label: 'Découvrir des destinations', onPress: () => router.navigate('/') }}
          />
        ) : (
          <EmptyState
            className="flex-none rounded-card border border-brand/15 bg-surface py-10"
            icon={UsersThreeIcon}
            title="Pas encore de voyage de groupe"
            description="Rejoins un ami avec son code, ou crée un voyage de groupe et invite tes amis."
          />
        ))}
      {shown.slice(0, visibleCount).map((trip) => (
        <TripCard
          key={trip.id}
          trip={trip}
          onDelete={() => deletion.remove(trip.id, tripDisplayTitle(trip))}
          isDeleting={deletion.deletingId === trip.id}
        />
      ))}
      {hiddenCount > 0 && (
        <Button
          label={`Voir plus de voyages (${hiddenCount})`}
          variant="outline"
          onPress={() => setVisibleCount((count) => count + PAGE_SIZE)}
        />
      )}
    </View>
  );
}
