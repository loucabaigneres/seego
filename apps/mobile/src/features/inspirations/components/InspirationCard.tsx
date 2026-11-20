import * as WebBrowser from 'expo-web-browser';
import { Pressable, View } from 'react-native';

import { cleanDescription } from '@/domain/place';
import type { RouterOutputs } from '@/lib/trpc';
import { colors } from '@seego/ui';
import { Badge, Button, cn, IconButton, Text } from '@/ui';
import { ArrowSquareOutIcon, PlusIcon, TrashIcon } from '@/ui/icons';

import { formatHashtags, platformLabel, shortUrl } from '../lib/inspiration';

export type InspirationItem = RouterOutputs['inspiration']['listMine'][number];

export interface InspirationCardProps {
  inspiration: InspirationItem;
  onDelete: () => void;
  isDeleting: boolean;
  /** Shown only when the AI found places to add. */
  onAddToTrip: () => void;
}

export function InspirationCard({
  inspiration,
  onDelete,
  isDeleting,
  onAddToTrip,
}: InspirationCardProps) {
  const description = cleanDescription(inspiration.description);
  const hashtags = formatHashtags(inspiration.tags);
  const placeCount = inspiration.extractedPlaces.length;

  return (
    <Pressable
      role="link"
      aria-label={`Ouvrir le lien ${platformLabel(inspiration.platform)}`}
      accessibilityHint={shortUrl(inspiration.originalUrl)}
      onPress={() => WebBrowser.openBrowserAsync(inspiration.originalUrl)}
      className="gap-2.5 rounded-card bg-surface p-4 active:opacity-80"
    >
      <View className="flex-row items-center gap-2.5">
        <Badge label={platformLabel(inspiration.platform)} tone="brand" />
        <Text variant="caption" numberOfLines={1} className="flex-1">
          {shortUrl(inspiration.originalUrl)}
        </Text>
        <ArrowSquareOutIcon size={20} color={colors.ink.muted} />
        <IconButton
          label="Supprimer l’inspiration"
          icon={TrashIcon}
          onPress={onDelete}
          disabled={isDeleting}
          className={cn('-my-2 -mr-2', isDeleting && 'opacity-50')}
        />
      </View>

      {description ? (
        <Text tone="secondary" numberOfLines={3} className="text-[15px] leading-[22px]">
          {description}
        </Text>
      ) : null}

      {hashtags.length > 0 && (
        <Text variant="caption" tone="brand" className="font-sans-medium">
          {hashtags.join('  ')}
        </Text>
      )}

      {placeCount > 0 && (
        <View className="flex-row items-center justify-between gap-3 pt-0.5">
          <Text variant="caption">
            <Text variant="section" tone="brand" className="text-lg">
              {placeCount}
            </Text>{' '}
            {placeCount > 1 ? 'lieux repérés' : 'lieu repéré'}
          </Text>
          <Button
            label="Ajouter à un voyage"
            variant="outline"
            size="sm"
            icon={PlusIcon}
            onPress={onAddToTrip}
          />
        </View>
      )}
    </Pressable>
  );
}
