import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { colors } from '@/theme/tokens';
import { cn, ProgressBar, Text } from '@/ui';
import { ArrowLeftIcon, CompassIcon } from '@/ui/icons';

import { LIKE_GOAL } from '../lib/deck';

function leaveDeck() {
  // Opened from a link, the deck has nothing to go back to.
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export interface DeckHeaderProps {
  likeCount: number;
  /** Absent while the feed loads: the button stays disabled. */
  onShowResult?: () => void;
}

export function DeckHeader({ likeCount, onShowResult }: DeckHeaderProps) {
  const progress = Math.min(likeCount, LIKE_GOAL);
  const goalReached = progress === LIKE_GOAL;
  const isResultDisabled = !onShowResult || likeCount === 0;

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
            {goalReached ? 'Assez de coups de cœur !' : 'Like ce qui te fait envie'}
          </Text>
          <Text variant="caption">
            {progress}/{LIKE_GOAL}
          </Text>
        </View>
        <ProgressBar value={progress / LIKE_GOAL} segments={LIKE_GOAL} />
      </View>

      {/* Icon only: a labelled pill squeezes the progress label onto two lines. */}
      <Pressable
        role="button"
        aria-label="Ma destination"
        aria-disabled={isResultDisabled}
        disabled={isResultDisabled}
        onPress={onShowResult}
        hitSlop={4}
        className={cn(
          'size-11 items-center justify-center rounded-full active:opacity-80',
          goalReached ? 'bg-brand' : 'border border-brand',
          isResultDisabled && 'opacity-40',
        )}
      >
        <CompassIcon
          size={22}
          weight={goalReached ? 'fill' : 'regular'}
          color={goalReached ? colors.ink.inverse : colors.brand}
        />
      </Pressable>
    </View>
  );
}
