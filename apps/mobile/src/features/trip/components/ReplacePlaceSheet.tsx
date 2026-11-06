import { Image } from 'expo-image';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';

import { categoryMeta, formatDistance } from '@/domain/place';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
  SegmentedControl,
  Sheet,
  Text,
  type Segment,
} from '@/ui';
import { CompassIcon, HeartIcon, MapPinIcon } from '@/ui/icons';

import type { CandidateSource, ReplacementCandidate, ReplacePlace } from '../hooks/useReplacePlace';

const SOURCE_SEGMENTS: readonly Segment<CandidateSource>[] = [
  { value: 'catalog', label: 'Sélection Seego' },
  { value: 'mine', label: 'Mes adresses' },
];

/** Places that can replace one of the planning; picking one saves it at once. */
export function ReplacePlaceSheet({ replace }: { replace: ReplacePlace }) {
  // Keeps the title while the closing animation plays.
  const [place, setPlace] = useState(replace.place);
  if (replace.place && replace.place !== place) setPlace(replace.place);
  const meta = categoryMeta(place?.category);
  const { candidates } = replace;

  return (
    // Fixed height: the sheet keeps its size from the spinner to the list instead of jumping.
    <Sheet visible={replace.place !== null} onClose={replace.close} className="h-[85%] px-0">
      <View className="gap-1 border-b border-line px-6 pb-3">
        <Text variant="overline">Choisir {meta.another}</Text>
        <Text variant="section" numberOfLines={1}>
          Remplacer « {place?.title} »
        </Text>
        <SegmentedControl
          segments={SOURCE_SEGMENTS}
          value={replace.source}
          onChange={replace.setSource}
          className="mt-2"
        />
      </View>

      {candidates.isLoading ? (
        <LoadingState label="Recherche de propositions…" />
      ) : candidates.isError ? (
        <ErrorState title="Impossible de charger les propositions" onRetry={candidates.retry} />
      ) : !candidates.data?.length ? (
        replace.source === 'mine' ? (
          <EmptyState
            icon={HeartIcon}
            title="Aucune adresse à toi"
            description="Les lieux que tu importes depuis tes inspirations apparaîtront ici."
          />
        ) : (
          <EmptyState
            icon={CompassIcon}
            title="Aucune autre proposition"
            description="On n’a pas d’autre lieu de ce type pour cette destination."
          />
        )
      ) : (
        <ScrollView contentContainerClassName="gap-3 px-6 py-4">
          {candidates.data.map((candidate) => (
            <CandidateRow
              key={candidate.id}
              candidate={candidate}
              isPicking={replace.pickingId === candidate.id}
              disabled={replace.pickingId !== undefined}
              onPick={() => replace.pick(candidate.id)}
            />
          ))}
        </ScrollView>
      )}

      {replace.errorMessage && <Notice message={replace.errorMessage} className="mx-6 mt-2" />}
    </Sheet>
  );
}

interface CandidateRowProps {
  candidate: ReplacementCandidate;
  isPicking: boolean;
  disabled: boolean;
  onPick: () => void;
}

function CandidateRow({ candidate, isPicking, disabled, onPick }: CandidateRowProps) {
  const meta = categoryMeta(candidate.category);
  const details = [
    candidate.price,
    candidate.distanceKm != null && `à ${formatDistance(candidate.distanceKm)} du lieu actuel`,
  ].filter(Boolean);

  return (
    <View className="flex-row gap-3 rounded-field bg-surface p-3">
      <View
        className="size-[68px] items-center justify-center overflow-hidden rounded-xl"
        style={{ backgroundColor: meta.colors.fill }}
      >
        {candidate.mainMediaUrl ? (
          <Image
            source={candidate.mainMediaUrl}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <MapPinIcon size={24} color={meta.colors.ink} />
        )}
      </View>

      <View className="flex-1 gap-1">
        <Text variant="label">{candidate.title}</Text>
        {candidate.suggested && <Badge label="Suggéré" />}
        {details.length > 0 && <Text variant="caption">{details.join(' · ')}</Text>}
        <Button
          label={isPicking ? 'Remplacement…' : 'Choisir'}
          variant="outline"
          size="sm"
          loading={isPicking}
          disabled={disabled}
          onPress={onPick}
          className="mt-1 self-start"
        />
      </View>
    </View>
  );
}
