import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { colors } from '@seego/ui';
import { Button, EmptyState, ErrorState, Notice, Skeleton, Tag, Text } from '@/ui';
import { ArrowRightIcon, MagnifyingGlassIcon, PlusIcon } from '@/ui/icons';

import { useDeleteInspiration } from '../hooks/useDeleteInspiration';
import { useMyInspirations } from '../hooks/useMyInspirations';
import { cityOptions, filterInspirations, hasActiveFilter, NO_FILTERS } from '../lib/filters';
import { AddToTripSheet, type AddToTripSheetProps } from './AddToTripSheet';
import { InspirationCard } from './InspirationCard';
import { InspirationFilterBar } from './InspirationFilterBar';
import { InspirationFilterSheet } from './InspirationFilterSheet';

/** No inspiration yet: a video in, places out, and the way to import the first one. */
function NoInspirations() {
  return (
    <View className="gap-4 rounded-card border border-line px-5 py-[22px]">
      <View aria-hidden className="flex-row items-center gap-2">
        <Tag label="TikTok" capitalize={false} className="bg-brand" textClassName="text-accent" />
        <Tag label="Instagram" capitalize={false} />
        <ArrowRightIcon size={20} color={colors.line.strong} />
        <Tag label="3 lieux" capitalize={false} className="bg-accent" textClassName="text-brand" />
      </View>
      <View className="gap-1.5">
        <Text variant="title" role="heading" className="text-[26px] leading-[30px]">
          Pas encore d’inspiration
        </Text>
        <Text tone="muted" className="text-[15px] leading-[22px]">
          Importe un TikTok ou un Reel : on repère les lieux pour tes prochains voyages. Tu peux
          aussi le partager à Seego depuis l’app.
        </Text>
      </View>
      <Button
        label="Importer une inspiration"
        icon={PlusIcon}
        onPress={() => router.push('/inspiration/import')}
      />
    </View>
  );
}

/** The user's imported inspirations with their loading, empty and error states. */
export function InspirationList() {
  const { inspirations, isLoading, hasFailed, retry } = useMyInspirations();
  const deletion = useDeleteInspiration();
  const [adding, setAdding] = useState<AddToTripSheetProps['inspiration']>(null);
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
    return <NoInspirations />;
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
          onAddToTrip={() => setAdding(inspiration)}
        />
      ))}
      <AddToTripSheet inspiration={adding} onClose={() => setAdding(null)} />
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
