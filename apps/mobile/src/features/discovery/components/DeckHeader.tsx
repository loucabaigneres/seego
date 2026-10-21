import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { colors } from '@/theme/tokens';
import { ProgressBar, Text } from '@/ui';
import { ArrowLeftIcon } from '@/ui/icons';

import { LIKE_GOAL } from '../lib/deck';

function leaveDeck() {
  // Opened from a link, the deck has nothing to go back to.
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export function DeckHeader({ likeCount }: { likeCount: number }) {
  const progress = Math.min(likeCount, LIKE_GOAL);

  return (
    <View className="flex-row items-center gap-3">
      {/* The swipe-back gesture is off on this screen (it would fight the cards): keep a way out. */}
      <Pressable
        role="button"
        aria-label="Quitter la découverte"
        onPress={leaveDeck}
        hitSlop={8}
        className="-ml-2 size-11 items-center justify-center rounded-full active:bg-surface"
      >
        <ArrowLeftIcon size={24} color={colors.ink.DEFAULT} />
      </Pressable>

      <View className="flex-1 gap-2">
        <View className="flex-row items-baseline justify-between">
          <Text variant="label">
            {progress === LIKE_GOAL ? 'Assez de coups de cœur !' : 'Like ce qui te fait envie'}
          </Text>
          <Text variant="caption">
            {progress}/{LIKE_GOAL}
          </Text>
        </View>
        <ProgressBar value={progress / LIKE_GOAL} segments={LIKE_GOAL} />
      </View>
    </View>
  );
}
