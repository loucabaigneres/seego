import type { ReactNode } from 'react';
import { View } from 'react-native';

import { SegmentedControl, type Segment } from '@/ui';

export type ProfileSegment = 'trips' | 'inspirations';

const SEGMENTS: readonly Segment<ProfileSegment>[] = [
  { value: 'trips', label: 'Voyages' },
  { value: 'inspirations', label: 'Inspirations' },
];

export interface ProfileContentProps {
  segment: ProfileSegment;
  onSegmentChange: (segment: ProfileSegment) => void;
  /** Lists come from other features: the profile route composes them. */
  trips: ReactNode;
  inspirations: ReactNode;
}

/** "Voyages | Inspirations" switch. */
export function ProfileContent({
  segment,
  onSegmentChange,
  trips,
  inspirations,
}: ProfileContentProps) {
  return (
    <View className="gap-4">
      <SegmentedControl segments={SEGMENTS} value={segment} onChange={onSegmentChange} />
      {segment === 'trips' ? trips : inspirations}
    </View>
  );
}
