import { View } from 'react-native';

import { EmptyState } from '@/ui';
import { MapTrifoldIcon } from '@/ui/icons';

import type { TripMapProps } from './TripMap';

/** react-native-maps has no web version: the web build only says where to find the map. */
export function TripMap({ height }: TripMapProps) {
  return (
    <View style={{ height }}>
      <EmptyState
        icon={MapTrifoldIcon}
        title="Carte disponible dans l’app"
        description="Ouvre ton voyage sur ton téléphone pour voir tes lieux sur la carte."
      />
    </View>
  );
}
