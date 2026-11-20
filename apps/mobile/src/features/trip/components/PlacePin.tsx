import { View } from 'react-native';

import { categoryMeta } from '@/domain/place';
import { colors } from '@seego/ui';
import { cn, Text } from '@/ui';

const SIZE = 34;
const SELECTED_SIZE = 48;

export interface PlacePinProps {
  category: string | null;
  /** The place's step in its day, as numbered in the timeline. */
  step: number;
  selected: boolean;
}

/**
 * Disc in the category colour with the step number; the selected one grows.
 * Drawn once as a bitmap by the map (`tracksViewChanges={false}`): its key must change with
 * `selected` for the new look to show.
 */
export function PlacePin({ category, step, selected }: PlacePinProps) {
  const { fill, ink } = categoryMeta(category).colors;
  const size = selected ? SELECTED_SIZE : SIZE;

  return (
    <View
      className={cn('items-center justify-center rounded-full', selected ? 'border-[3px]' : 'border-2')}
      style={{ width: size, height: size, backgroundColor: fill, borderColor: colors.background }}
    >
      <Text
        className={cn('font-display', selected ? 'text-[22px] leading-7' : 'text-[17px] leading-6')}
        style={{ color: ink }}
      >
        {step}
      </Text>
    </View>
  );
}
