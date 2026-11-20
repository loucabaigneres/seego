import { View, type LayoutChangeEvent } from 'react-native';

import { SegmentedControl, type Segment } from '@/ui';
import { ListBulletsIcon, MapTrifoldIcon } from '@/ui/icons';

import type { ItineraryView } from '../hooks/useItineraryView';
import { DayPicker, type DayPickerProps } from './DayPicker';

const VIEW_SEGMENTS: readonly Segment<ItineraryView>[] = [
  { value: 'itinerary', label: 'Liste', icon: ListBulletsIcon },
  { value: 'map', label: 'Carte', icon: MapTrifoldIcon },
];

export interface ItineraryToolbarProps extends DayPickerProps {
  view: ItineraryView;
  onViewChange: (view: ItineraryView) => void;
  onLayout?: (event: LayoutChangeEvent) => void;
  /** False while editing the planning: edits happen in the timeline, not on the map. */
  canSwitchView?: boolean;
}

/** Sticky header of the itinerary: the day picker, then the timeline / map switch. */
export function ItineraryToolbar({
  view,
  onViewChange,
  onLayout,
  canSwitchView = true,
  ...dayPicker
}: ItineraryToolbarProps) {
  return (
    // Full-bleed crema background so the content does not show through once stuck.
    <View className="-mx-6 border-b border-line bg-background px-6 pb-3" onLayout={onLayout}>
      <DayPicker {...dayPicker} />
      {canSwitchView && (
        <SegmentedControl
          segments={VIEW_SEGMENTS}
          value={view}
          onChange={onViewChange}
          variant="soft"
        />
      )}
    </View>
  );
}
