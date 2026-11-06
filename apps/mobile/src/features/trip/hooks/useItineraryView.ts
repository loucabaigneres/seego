import { useState } from 'react';
import { useWindowDimensions, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type ItineraryView = 'itinerary' | 'map';

/** `Screen`'s gap-4 between the toolbar and the content, and its bottom padding (py-6). */
const CONTENT_GAP = 16;
const SCREEN_BOTTOM_PADDING = 24;

/**
 * Itinerary shown as a timeline or as a map. The map fills the screen under the sticky toolbar,
 * so switching to it scrolls the hero away.
 */
export function useItineraryView(scrollToPicker: (animated?: boolean) => void) {
  const [view, setView] = useState<ItineraryView>('itinerary');
  const [toolbarHeight, setToolbarHeight] = useState(0);
  const { height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  return {
    view,
    setView: (next: ItineraryView) => {
      setView(next);
      // Next frame: the map has to be laid out first, or the scroll stops short of the picker.
      if (next === 'map') requestAnimationFrame(() => scrollToPicker(true));
    },
    mapHeight:
      windowHeight -
      insets.top -
      insets.bottom -
      toolbarHeight -
      CONTENT_GAP -
      SCREEN_BOTTOM_PADDING,
    onToolbarLayout: (event: LayoutChangeEvent) => {
      setToolbarHeight(event.nativeEvent.layout.height);
    },
  };
}
