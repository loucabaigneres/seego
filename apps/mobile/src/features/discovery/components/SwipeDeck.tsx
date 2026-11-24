import type { RefObject } from 'react';
import { View } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';

import type { DiscoveryPlace } from '../lib/discovery-place';
import { SwipeCard, type SwipeCardHandle } from './SwipeCard';

export interface SwipeDeckProps {
  /** Top card first. */
  cards: DiscoveryPlace[];
  topCardRef: RefObject<SwipeCardHandle | null>;
  dragX: SharedValue<number>;
  isLeaving: boolean;
  onDecide: (liked: boolean) => void;
  /** Whether the top card shows its details. */
  detailsOpen: boolean;
  onDetailsChange: (open: boolean) => void;
}

export function SwipeDeck({
  cards,
  topCardRef,
  dragX,
  isLeaving,
  onDecide,
  detailsOpen,
  onDetailsChange,
}: SwipeDeckProps) {
  return (
    // Room for the two cards peeking out underneath (STACK_PEEK each).
    <View className="mb-5 flex-1">
      {cards
        .map((place, position) => (
          <SwipeCard
            key={place.id}
            ref={position === 0 ? topCardRef : undefined}
            place={place}
            position={position}
            isLeaving={isLeaving}
            dragX={dragX}
            onDecide={onDecide}
            isExpanded={position === 0 && detailsOpen}
            onExpandedChange={position === 0 ? onDetailsChange : undefined}
          />
        ))
        // The last child is drawn on top: the top card renders last.
        .reverse()}
    </View>
  );
}
