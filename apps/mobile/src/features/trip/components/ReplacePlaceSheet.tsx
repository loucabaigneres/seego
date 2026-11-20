import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { categoryMeta, formatDistance } from '@/domain/place';
import { colors } from '@seego/ui';
import {
  Button,
  cn,
  EmptyState,
  ErrorState,
  LoadingState,
  Notice,
  SearchField,
  SegmentedControl,
  Sheet,
  Text,
  type Segment,
} from '@/ui';
import { CheckCircleIcon, CompassIcon, HeartIcon, MagnifyingGlassIcon } from '@/ui/icons';

import type { CandidateSource, ReplacementCandidate, ReplacePlace } from '../hooks/useReplacePlace';
import { stepLabel } from '../lib/steps';
import { CategoryIcon } from './category-icons';

const SOURCES: readonly Segment<CandidateSource>[] = [
  { value: 'catalog', label: 'Sélection Seego' },
  { value: 'mine', label: 'Mes adresses' },
];

/** Places that can replace one of the planning: pick one, then confirm. */
export function ReplacePlaceSheet({ replace }: { replace: ReplacePlace }) {
  // Keeps the title while the closing animation plays.
  const [place, setPlace] = useState(replace.place);
  if (replace.place && replace.place !== place) setPlace(replace.place);
  const { candidates, selected } = replace;

  return (
    // Fixed height: the sheet keeps its size from the spinner to the list instead of jumping.
    <Sheet visible={replace.place !== null} onClose={replace.close} className="h-[85%] px-0">
      <View className="gap-4 px-6 pb-3">
        <View className="gap-1">
          <Text variant="overline" tone="brand">
            Remplacer l’étape {stepLabel(replace.step)}
          </Text>
          <Text variant="title" role="heading">
            Une autre idée ?
          </Text>
          <Text variant="caption" numberOfLines={1}>
            À la place de {place?.title}
          </Text>
        </View>
        <SearchField
          value={replace.query}
          onChangeText={replace.setQuery}
          placeholder="Rechercher par nom"
          className="rounded-field border-0 bg-surface"
        />
        <SegmentedControl segments={SOURCES} value={replace.source} onChange={replace.setSource} />
      </View>

      <View className="flex-1">
        {candidates.isLoading ? (
          <LoadingState label="Recherche de propositions…" />
        ) : candidates.isError ? (
          <ErrorState title="Impossible de charger les propositions" onRetry={candidates.retry} />
        ) : !candidates.data?.length ? (
          replace.query.trim() ? (
            <EmptyState
              icon={MagnifyingGlassIcon}
              title="Aucun résultat"
              description={`Aucun lieu ne correspond à « ${replace.query.trim()} ».`}
            />
          ) : replace.source === 'mine' ? (
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
          <ScrollView
            role="radiogroup"
            aria-label="Propositions"
            contentContainerClassName="gap-2 px-6 py-2"
            keyboardShouldPersistTaps="handled"
          >
            {candidates.data.map((candidate) => (
              <CandidateOption
                key={candidate.id}
                candidate={candidate}
                selected={candidate.id === selected?.id}
                disabled={replace.isReplacing}
                onPress={() => replace.select(candidate.id)}
              />
            ))}
          </ScrollView>
        )}
      </View>

      <View className="gap-2 px-6 pt-3">
        {replace.errorMessage && <Notice message={replace.errorMessage} />}
        <Button
          label={selected ? `Remplacer par ${selected.title}` : 'Choisis un lieu'}
          loading={replace.isReplacing}
          disabled={!selected}
          onPress={replace.confirm}
        />
      </View>
    </Sheet>
  );
}

interface CandidateOptionProps {
  candidate: ReplacementCandidate;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
}

function CandidateOption({ candidate, selected, disabled, onPress }: CandidateOptionProps) {
  const meta = categoryMeta(candidate.category);
  const details = [
    candidate.suggested && 'Suggéré',
    meta.label,
    candidate.price,
    candidate.distanceKm != null && `à ${formatDistance(candidate.distanceKm)} du lieu actuel`,
  ].filter(Boolean);

  return (
    <Pressable
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onPress={onPress}
      className={cn(
        // The border is always there, so selecting does not shift the content.
        'flex-row items-center gap-3 rounded-field border-[1.5px] p-2.5 active:opacity-80',
        selected ? 'border-brand bg-background' : 'border-transparent bg-surface',
      )}
    >
      <View
        className="size-14 items-center justify-center overflow-hidden rounded-xl"
        style={{ backgroundColor: meta.colors.fill }}
      >
        {candidate.mainMediaUrl ? (
          <Image
            source={candidate.mainMediaUrl}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <CategoryIcon category={candidate.category} size={24} color={meta.colors.ink} />
        )}
      </View>

      <View className="flex-1">
        <Text variant="label">{candidate.title}</Text>
        <Text variant="caption">{details.join(' · ')}</Text>
      </View>

      {selected ? (
        <CheckCircleIcon size={24} weight="fill" color={colors.brand} />
      ) : (
        <View className="size-[22px] rounded-full border-[1.5px] border-line-strong" />
      )}
    </Pressable>
  );
}
