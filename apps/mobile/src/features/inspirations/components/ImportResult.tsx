import { View } from 'react-native';

import type { RouterOutputs } from '@/lib/trpc';
import { colors } from '@seego/ui';
import { Badge, Button, Card, Notice, Text } from '@/ui';
import { MapPinIcon, PlusIcon } from '@/ui/icons';

import { formatHashtags, placeLocation, platformLabel } from '../lib/inspiration';

export type AnalysisResult = RouterOutputs['inspiration']['analyzeFromUrl'];

export interface ImportResultProps {
  result: AnalysisResult;
  onAddToTrip: () => void;
  onImportAnother: () => void;
}

/** What the AI found in the post: its summary, the places and the hashtags. */
export function ImportResult({ result, onAddToTrip, onImportAnother }: ImportResultProps) {
  const { inspiration, alreadyImported } = result;
  const places = inspiration.extractedPlaces;
  const hashtags = formatHashtags(inspiration.tags);

  return (
    <View className="gap-5">
      <Notice tone="success" message={`Analysé depuis ${platformLabel(inspiration.platform)}`} />
      {alreadyImported && (
        <Notice message="Cette vidéo avait déjà été analysée : voici son analyse, sans doublon." />
      )}

      {inspiration.aiReport ? (
        <View className="gap-2">
          <Text variant="section">Compte rendu</Text>
          <Text tone="secondary">{inspiration.aiReport}</Text>
        </View>
      ) : null}

      <View className="gap-3">
        <Text variant="section">Lieux détectés</Text>
        {places.length === 0 ? (
          <Text tone="muted">Aucun lieu détecté dans cette publication.</Text>
        ) : (
          places.map((place, index) => {
            const location = placeLocation(place);
            return (
              <Card key={`${place.name}-${index}`} className="flex-row gap-3 p-4">
                <MapPinIcon size={20} color={colors.brand} />
                <View className="flex-1 gap-1">
                  <View className="flex-row flex-wrap items-center gap-2">
                    <Text variant="label">{place.name}</Text>
                    {place.category && <Badge label={place.category} tone="accent" />}
                  </View>
                  {location ? <Text variant="caption">{location}</Text> : null}
                  {place.description ? (
                    <Text variant="caption" tone="secondary">
                      {place.description}
                    </Text>
                  ) : null}
                </View>
              </Card>
            );
          })
        )}
      </View>

      {hashtags.length > 0 && (
        <Text variant="caption" tone="brand">
          {hashtags.join('  ')}
        </Text>
      )}

      <View className="gap-3">
        {places.length > 0 && (
          <Button label="Ajouter à un voyage" variant="cta" icon={PlusIcon} onPress={onAddToTrip} />
        )}
        <Button label="Importer un autre lien" variant="outline" onPress={onImportAnother} />
      </View>
    </View>
  );
}
