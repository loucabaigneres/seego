import * as WebBrowser from 'expo-web-browser';
import { Pressable, View } from 'react-native';

import { cleanDescription } from '@/domain/place';
import type { RouterOutputs } from '@/lib/trpc';
import { colors } from '@seego/ui';
import { Badge, cn, IconButton, Text } from '@/ui';
import { ArrowSquareOutIcon, TrashIcon } from '@/ui/icons';

import { formatHashtags, platformLabel, shortUrl } from '../lib/inspiration';

export type InspirationItem = RouterOutputs['inspiration']['listMine'][number];

export interface InspirationCardProps {
  inspiration: InspirationItem;
  onDelete: () => void;
  isDeleting: boolean;
}

export function InspirationCard({ inspiration, onDelete, isDeleting }: InspirationCardProps) {
  const description = cleanDescription(inspiration.description);
  const hashtags = formatHashtags(inspiration.tags);

  return (
    <Pressable
      role="link"
      aria-label={`Ouvrir le lien ${platformLabel(inspiration.platform)}`}
      accessibilityHint={shortUrl(inspiration.originalUrl)}
      onPress={() => WebBrowser.openBrowserAsync(inspiration.originalUrl)}
      className="gap-3 rounded-card border border-brand/15 bg-surface p-5 active:opacity-80"
    >
      <View className="flex-row items-center gap-3">
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
        <Text tone="secondary" numberOfLines={3}>
          {description}
        </Text>
      ) : null}

      <Text variant="caption" tone={hashtags.length ? 'brand' : 'muted'}>
        {hashtags.length ? hashtags.join('  ') : 'Aucun hashtag détecté'}
      </Text>
    </Pressable>
  );
}
