import { View } from 'react-native';

import { EmptyState, ErrorState, Notice, Skeleton } from '@/ui';
import { SparkleIcon } from '@/ui/icons';

import { useDeleteInspiration } from '../hooks/useDeleteInspiration';
import { useMyInspirations } from '../hooks/useMyInspirations';
import { InspirationCard } from './InspirationCard';

/** The user's imported inspirations with their loading, empty and error states. */
export function InspirationList() {
  const { inspirations, isLoading, hasFailed, retry } = useMyInspirations();
  const deletion = useDeleteInspiration();

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
        description="Les vidéos TikTok ou Instagram que tu importes depuis le site apparaîtront ici. L’import arrive bientôt sur mobile."
      />
    );
  }

  return (
    <View className="gap-3">
      {deletion.failed && (
        <Notice message="Impossible de supprimer cette inspiration pour le moment. Réessaie." />
      )}
      {inspirations.map((inspiration) => (
        <InspirationCard
          key={inspiration.id}
          inspiration={inspiration}
          onDelete={() => deletion.remove(inspiration.id)}
          isDeleting={deletion.deletingId === inspiration.id}
        />
      ))}
    </View>
  );
}
