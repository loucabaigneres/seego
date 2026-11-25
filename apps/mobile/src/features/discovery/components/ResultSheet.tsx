import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors } from '@seego/ui';
import { Button, cn, ErrorState, LoadingState, Notice, Sheet, Text } from '@/ui';
import { ArrowRightIcon, HeartIcon } from '@/ui/icons';

import type { useDestinationResult } from '../hooks/useDestinationResult';
import { LIKE_GOAL } from '../lib/deck';
import { DestinationResult } from './DestinationResult';

export interface ResultSheetProps {
  result: ReturnType<typeof useDestinationResult>;
  likeCount: number;
  seenCount: number;
  onRestart: () => void;
}

/** Too few likes for a match: one heart per like still needed, and back to the deck. */
function NotEnoughLikes({ likeCount, onContinue }: { likeCount: number; onContinue: () => void }) {
  const filled = Math.min(likeCount, LIKE_GOAL);
  return (
    <View className="items-center gap-[18px] px-6 pt-2.5">
      <View
        role="img"
        aria-label={`${filled} coups de cœur sur ${LIKE_GOAL}`}
        className="flex-row gap-1.5"
      >
        {Array.from({ length: LIKE_GOAL }, (_, index) => (
          <HeartIcon
            key={index}
            size={24}
            weight={index < filled ? 'fill' : 'regular'}
            color={index < filled ? colors.cta : colors.line.strong}
          />
        ))}
      </View>
      <Text variant="title" role="heading" className="text-center text-[32px] leading-9">
        Encore quelques swipes
      </Text>
      <Text tone="muted" className="max-w-[300px] text-center">
        Like quelques lieux de plus pour qu’on cerne tes envies.
      </Text>
      <Text variant="caption">
        {likeCount > 1 ? `${likeCount} coups de cœur` : `${likeCount} coup de cœur`} pour l’instant
      </Text>
      <Button label="Continuer à swiper" onPress={onContinue} className="self-stretch" />
    </View>
  );
}

/** The destination matching the swipes, and the way to plan a trip there. */
export function ResultSheet({ result, likeCount, seenCount, onRestart }: ResultSheetProps) {
  const { destination } = result;
  const state = result.isLoading
    ? 'loading'
    : result.hasFailed
      ? 'error'
      : destination
        ? 'ready'
        : 'empty';

  return (
    // Fixed height: the sheet keeps its size from the spinner to the result instead of jumping.
    // The match itself is on vino; the waiting, error and empty states stay on crema.
    // Too few likes is a short message: that sheet fits its content.
    <Sheet
      visible={result.isOpen}
      onClose={result.close}
      className={cn('px-0', state !== 'empty' && 'h-[88%]', state === 'ready' && 'bg-brand')}
    >
      {/* Keyed by state so each one fades in rather than popping. */}
      <Animated.View
        key={state}
        entering={FadeIn.duration(220)}
        className={state === 'empty' ? undefined : 'flex-1'}
      >
        {state === 'loading' && <LoadingState label="On calcule ta destination…" />}
        {state === 'error' && (
          <ErrorState title="Le calcul n’a pas abouti" onRetry={result.retry} />
        )}
        {state === 'empty' && <NotEnoughLikes likeCount={likeCount} onContinue={result.close} />}
        {state === 'ready' && destination && (
          <>
            <DestinationResult
              destination={destination}
              confidence={result.confidence}
              likeCount={likeCount}
              seenCount={seenCount}
              onClose={result.close}
            />
            <View className="gap-1.5 px-6 pt-3">
              {result.saveFailed && (
                <Notice message="Impossible de créer ton voyage pour le moment. Réessaie dans un instant." />
              )}
              <Button
                label={result.isSaving ? 'Création du voyage…' : 'On part quand ?'}
                variant="onBrand"
                icon={ArrowRightIcon}
                loading={result.isSaving}
                onPress={result.save}
              />
              <View className="flex-row gap-2">
                <Button
                  label="Continuer à swiper"
                  variant="onBrandSoft"
                  size="sm"
                  onPress={result.close}
                  className="flex-1"
                />
                <Button
                  label="Recommencer"
                  variant="onBrandSoft"
                  size="sm"
                  onPress={onRestart}
                  className="flex-1"
                />
              </View>
            </View>
          </>
        )}
      </Animated.View>
    </Sheet>
  );
}
