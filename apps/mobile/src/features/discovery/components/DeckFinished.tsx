import { Image } from 'expo-image';
import { View } from 'react-native';

import { Button, cn, Text } from '@/ui';
import { ArrowCounterClockwiseIcon, CompassIcon } from '@/ui/icons';

export interface DeckFinishedProps {
  seenCount: number;
  likeCount: number;
  /** Up to two photos from the session */
  photos: string[];
  onShowResult: () => void;
  onRestart: () => void;
}

function TiltedPhoto({ uri, className }: { uri?: string; className: string }) {
  return (
    <View
      className={cn(
        'absolute top-[30px] h-[200px] w-[150px] overflow-hidden rounded-card bg-ink',
        className,
      )}
    >
      {uri && (
        <Image
          source={uri}
          style={{ width: '100%', height: '100%', opacity: 0.55 }}
          contentFit="cover"
        />
      )}
    </View>
  );
}

/** End of the deck: how many places were seen, then the result or a new round. */
export function DeckFinished({
  seenCount,
  likeCount,
  photos,
  onShowResult,
  onRestart,
}: DeckFinishedProps) {
  return (
    <View className="flex-1 justify-between">
      <View className="items-center gap-8 pt-6">
        <View aria-hidden className="h-[260px] w-[300px]">
          <TiltedPhoto uri={photos[0]} className="left-0 -rotate-12" />
          <TiltedPhoto uri={photos[1]} className="right-0 rotate-[10deg]" />
          <View className="absolute left-[75px] top-[10px] h-[200px] w-[150px] items-center justify-center gap-0.5 rounded-card bg-brand">
            <Text variant="display" tone="inverse" className="text-[72px] leading-[72px]">
              {seenCount}
            </Text>
            <Text variant="overline" tone="accent" className="text-[10px]">
              {seenCount > 1 ? 'lieux vus' : 'lieu vu'}
            </Text>
          </View>
        </View>
        <View className="items-center gap-3">
          <Text variant="title" role="heading" className="text-center text-[34px] leading-[38px]">
            Tu as parcouru tous les lieux !
          </Text>
          <Text tone="muted" className="text-center">
            Découvre la destination qui te correspond, ou recommence pour affiner tes goûts.
          </Text>
        </View>
      </View>
      <View className="gap-2.5">
        {likeCount > 0 && (
          <Button
            label="Voir ma destination"
            variant="cta"
            icon={CompassIcon}
            onPress={onShowResult}
          />
        )}
        <Button
          label="Recommencer"
          variant="outline"
          icon={ArrowCounterClockwiseIcon}
          onPress={onRestart}
        />
      </View>
    </View>
  );
}
