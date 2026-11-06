import { View, type LayoutChangeEvent } from 'react-native';

import { SegmentedControl, type Segment } from '@/ui';

import type { ItineraryView } from '../hooks/useItineraryView';
import { DayPicker, type DayPickerProps } from './DayPicker';

const VIEW_SEGMENTS: readonly Segment<ItineraryView>[] = [
  { value: 'itinerary', label: 'Itinéraire' },
  { value: 'map', label: 'Carte' },
];

export interface ItineraryToolbarProps extends DayPickerProps {
  view: ItineraryView;
  onViewChange: (view: ItineraryView) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

/** Sticky header of the itinerary: the day picker, then the timeline / map switch. */
export function ItineraryToolbar({ view, onViewChange, onLayout, ...dayPicker }: ItineraryToolbarProps) {
  return (
    // Full-bleed crema background so the content does not show through once stuck.
    <View className="-mx-6 bg-background px-6 pb-3" onLayout={onLayout}>
      <DayPicker {...dayPicker} />
      <SegmentedControl segments={VIEW_SEGMENTS} value={view} onChange={onViewChange} />
    </View>
  );
}
