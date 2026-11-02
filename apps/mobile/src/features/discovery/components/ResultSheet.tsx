import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Button, EmptyState, ErrorState, LoadingState, Notice, Sheet } from '@/ui';
import { ArrowRightIcon, CompassIcon } from '@/ui/icons';

import type { useDestinationResult } from '../hooks/useDestinationResult';
import { DestinationResult } from './DestinationResult';

export interface ResultSheetProps {
  result: ReturnType<typeof useDestinationResult>;
  likeCount: number;
  seenCount: number;
  onRestart: () => void;
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
    <Sheet visible={result.isOpen} onClose={result.close} className="h-[88%] px-0">
      {/* Keyed by state so each one fades in rather than popping. */}
      <Animated.View key={state} entering={FadeIn.duration(220)} className="flex-1">
        {state === 'loading' && <LoadingState label="On calcule ta destination…" />}
        {state === 'error' && (
          <ErrorState title="Le calcul n’a pas abouti" onRetry={result.retry} />
        )}
        {state === 'empty' && (
          <EmptyState
            icon={CompassIcon}
            title="Encore quelques swipes"
            description="Like quelques lieux de plus pour qu’on cerne tes envies."
            action={{ label: 'Continuer à swiper', onPress: result.close }}
          />
        )}
        {state === 'ready' && destination && (
          <>
            <DestinationResult
              destination={destination}
              confidence={result.confidence}
              likeCount={likeCount}
              seenCount={seenCount}
              onClose={result.close}
            />
            <View className="gap-2 border-t border-line px-6 pt-3">
              {result.saveFailed && (
                <Notice message="Impossible de créer ton voyage pour le moment. Réessaie dans un instant." />
              )}
              <Button
                label={
                  result.isSaving
                    ? 'Création du voyage…'
                    : `Planifier mon voyage à ${destination.city}`
                }
                icon={ArrowRightIcon}
                loading={result.isSaving}
                onPress={result.save}
              />
              <View className="flex-row gap-2">
                <Button
                  label="Continuer à swiper"
                  variant="outline"
                  size="sm"
                  onPress={result.close}
                  className="flex-1"
                />
                <Button
                  label="Recommencer"
                  variant="ghost"
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
