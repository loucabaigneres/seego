import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { EmptyState } from '@/ui';
import { MapTrifoldIcon } from '@/ui/icons';

import { useTripMap } from '../hooks/useTripMap';
import type { TripDay } from '../hooks/useTrip';
import { CategoryFilter } from './CategoryFilter';
import { MapPlaceCard } from './MapPlaceCard';
import { PlacePin } from './PlacePin';

export interface TripMapProps {
  /** The days picked in the day picker. */
  days: TripDay[];
  /** Height of the whole block, filters included. */
  height: number;
}

const REFRAME_DURATION_MS = 300;

/** The itinerary's places as category pins, with a category filter and the tapped place's card. */
export function TripMap({ days, height }: TripMapProps) {
  const map = useTripMap(days);
  const mapRef = useRef<MapView>(null);

  // Reframe whenever the day or category filter changes the pins on screen.
  const visibleIds = map.visiblePins.map((pin) => pin.id).join(',');
  const reframe = useEffectEvent(() => {
    if (map.region) mapRef.current?.animateToRegion(map.region, REFRAME_DURATION_MS);
  });
  useEffect(() => {
    reframe();
  }, [visibleIds]);

  if (!map.hasPins || !map.region) {
    return (
      <View style={{ height }}>
        <EmptyState
          icon={MapTrifoldIcon}
          title="Aucun lieu localisé"
          description="Les lieux de ces jours n’ont pas encore d’adresse sur la carte."
        />
      </View>
    );
  }

  const { selectedPin } = map;

  return (
    <View className="gap-3" style={{ height }}>
      <CategoryFilter
        categories={map.categories}
        selected={map.category}
        onToggle={map.toggleCategory}
      />

      <View className="flex-1 overflow-hidden rounded-card bg-surface">
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={map.region}
          toolbarEnabled={false}
          // iOS also reports pin taps here: only a tap on the map itself closes the card.
          onPress={(event) => {
            if (event.nativeEvent.action !== 'marker-press') map.clearSelection();
          }}
        >
          {map.visiblePins.map((pin) => {
            const selected = pin.id === selectedPin?.id;
            return (
              <PinMarker
                // The pin is a bitmap: a new key redraws it in its selected look.
                key={`${pin.id}-${selected}`}
                coordinate={pin.coordinate}
                title={pin.activity.locationName ?? pin.activity.title}
                category={pin.category}
                selected={selected}
                onPress={() => map.select(pin.id)}
              />
            );
          })}
        </MapView>

        {selectedPin && (
          <MapPlaceCard
            activity={selectedPin.activity}
            dayIndex={selectedPin.dayIndex}
            onClose={map.clearSelection}
          />
        )}
      </View>
    </View>
  );
}

interface PinMarkerProps {
  coordinate: { latitude: number; longitude: number };
  title: string;
  category: string | null;
  selected: boolean;
  onPress: () => void;
}

function PinMarker({ coordinate, title, category, selected, onPress }: PinMarkerProps) {
  // Android snapshots the custom view into a bitmap: track it until its icon has been drawn,
  // then freeze it so the map does not redraw every pin on each frame.
  const [tracksViewChanges, setTracksViewChanges] = useState(true);

  return (
    <Marker
      coordinate={coordinate}
      accessibilityLabel={title}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
      onPress={onPress}
      style={{ zIndex: selected ? 1 : 0 }}
    >
      <View
        onLayout={() => requestAnimationFrame(() => setTracksViewChanges(false))}
        collapsable={false}
      >
        <PlacePin category={category} selected={selected} />
      </View>
    </Marker>
  );
}
