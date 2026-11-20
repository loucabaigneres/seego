import { View } from 'react-native';

import { pluralize } from '@/domain/date';
import type { RouterOutputs } from '@/lib/trpc';
import { colors } from '@seego/ui';
import { Badge, Button, cn, IconButton, Notice, Text } from '@/ui';
import { ArrowLeftIcon, CheckCircleIcon, PlusIcon } from '@/ui/icons';

import { formatHashtags, placeLocation, platformLabel } from '../lib/inspiration';

export type AnalysisResult = RouterOutputs['inspiration']['analyzeFromUrl'];

export interface ImportResultProps {
  result: AnalysisResult;
  onAddToTrip: () => void;
  /** Also the back arrow: back to an empty form. */
  onImportAnother: () => void;
}

/** What the AI found in the post: its summary, the places and the hashtags. */
export function ImportResult({ result, onAddToTrip, onImportAnother }: ImportResultProps) {
  const { inspiration, alreadyImported } = result;
  const places = inspiration.extractedPlaces;
  const hashtags = formatHashtags(inspiration.tags);

  return (
    <View className="flex-1 gap-5">
      <View className="-ml-2.5 flex-row items-center justify-between">
        <IconButton label="Retour" icon={ArrowLeftIcon} onPress={onImportAnother} />
        <View className="flex-row items-center gap-1.5">
          <CheckCircleIcon size={16} weight="fill" color={colors.success.DEFAULT} />
          <Text variant="caption" tone="success" className="font-sans-semibold">
            Analysé depuis {platformLabel(inspiration.platform)}
          </Text>
        </View>
      </View>

      {alreadyImported && (
        <Notice message="Cette vidéo avait déjà été analysée : voici son analyse, sans doublon." />
      )}

      {inspiration.aiReport ? (
        <View className="gap-2">
          <Text variant="overline">Compte rendu</Text>
          <Text variant="section" className="text-[22px] leading-7">
            {inspiration.aiReport}
          </Text>
        </View>
      ) : null}

      <View>
        <View className="flex-row items-baseline justify-between pb-1">
          <Text variant="section" role="heading" className="text-[28px] leading-[30px]">
            Lieux détectés
          </Text>
          {places.length > 0 && <Text variant="caption">{pluralize(places.length, 'lieu', 'lieux')}</Text>}
        </View>
        {places.length === 0 ? (
          <Text tone="muted">Aucun lieu détecté dans cette publication.</Text>
        ) : (
          places.map((place, index) => {
            const location = placeLocation(place);
            return (
              <View
                key={`${place.name}-${index}`}
                className={cn(
                  'flex-row gap-3.5 py-3',
                  index < places.length - 1 && 'border-b border-line',
                )}
              >
                <Text variant="section" tone="brand" className="w-7 text-[22px] leading-6">
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <View className="flex-1 gap-0.5">
                  <View className="flex-row flex-wrap items-center gap-2">
                    <Text variant="label" className="text-control">
                      {place.name}
                    </Text>
                    {place.category && <Badge label={place.category} tone="accent" />}
                  </View>
                  {location ? <Text variant="caption">{location}</Text> : null}
                  {place.description ? (
                    <Text variant="caption" tone="secondary">
                      {place.description}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })
        )}
      </View>

      {hashtags.length > 0 && (
        <Text variant="caption" tone="brand" className="-mt-2 font-sans-medium">
          {hashtags.join('  ')}
        </Text>
      )}

      <View className="mt-auto gap-1.5">
        {places.length > 0 && (
          <Button label="Ajouter à un voyage" variant="cta" icon={PlusIcon} onPress={onAddToTrip} />
        )}
        <Button label="Importer un autre lien" variant="text" size="sm" onPress={onImportAnother} />
      </View>
    </View>
  );
}
