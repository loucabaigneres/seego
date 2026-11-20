import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { EmptyState, ErrorState, Notice, Skeleton } from '@/ui';
import { MagnifyingGlassIcon, SparkleIcon } from '@/ui/icons';


import { useDeleteInspiration } from '../hooks/useDeleteInspiration';
import { useMyInspirations } from '../hooks/useMyInspirations';
import { cityOptions, filterInspirations, hasActiveFilter, NO_FILTERS } from '../lib/filters';
import { AddToTripSheet } from './AddToTripSheet';
import { InspirationCard } from './InspirationCard';
import { InspirationFilterBar } from './InspirationFilterBar';
import { InspirationFilterSheet } from './InspirationFilterSheet';

/** The user's imported inspirations with their loading, empty and error states. */
export function InspirationList() {
  const { inspirations, isLoading, hasFailed, retry } = useMyInspirations();
  const deletion = useDeleteInspiration();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const shown = filterInspirations(inspirations, filters);


  if (isLoading) {
    return (
      <View className="gap-3" aria-busy>
        <Skeleton className="h-32 rounded-card" />
        <Skeleton className="h-32 rounded-card" />
      </View>
    );
  }

  if (hasFailed) {
    return (
      <ErrorState
        className="flex-none"
        title="Inspirations indisponibles"
        message="Impossible de charger tes inspirations. Vérifie ta connexion, puis on réessaie."
        onRetry={retry}
      />
    );
  }

  if (inspirations.length === 0) {
    return (
      <EmptyState
        className="flex-none rounded-card border border-brand/15 bg-surface py-10"
        icon={SparkleIcon}
        title="Pas encore d’inspiration"
        description="Importe un TikTok ou un Reel : on repère les lieux pour tes prochains voyages. Tu peux aussi le partager à Seego depuis l’app."
        action={{ label: 'Importer une vidéo', onPress: () => router.push('/inspiration/import') }}
      />
    );
  }

  return (
    <View className="gap-3">
      <InspirationFilterBar
        filters={filters}
        onChange={setFilters}
        onOpenFilters={() => setIsFilterSheetOpen(true)}
      />
      {deletion.failed && (
        <Notice message="Impossible de supprimer cette inspiration pour le moment. Réessaie." />
      )}
      {shown.length === 0 && hasActiveFilter(filters) && (
        <EmptyState
          className="flex-none py-8"
          icon={MagnifyingGlassIcon}
          title="Aucune inspiration trouvée"
          description="Essaie un autre mot ou retire un filtre."
          action={{ label: 'Effacer les filtres', onPress: () => setFilters(NO_FILTERS) }}
        />
      )}
      {shown.map((inspiration) => (

        <InspirationCard
          key={inspiration.id}
          inspiration={inspiration}
          onDelete={() => deletion.remove(inspiration.id)}
          isDeleting={deletion.deletingId === inspiration.id}
          onAddToTrip={() => setAddingId(inspiration.id)}

        />
      ))}
      <AddToTripSheet inspirationId={addingId} onClose={() => setAddingId(null)} />
      <InspirationFilterSheet
        visible={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={filters}
        onChange={setFilters}
        cities={cityOptions(inspirations)}
        resultCount={shown.length}
      />
    </View>
  );
}
