import { View } from 'react-native';

import { categoryMeta } from '@/domain/place';
import { colors } from '@/theme/tokens';

import { CategoryIcon } from './category-icons';

const SIZE = 32;
const SELECTED_SIZE = 40;

export interface PlacePinProps {
  category: string | null;
  selected: boolean;
}

/**
 * Disc in the category colour with its pictogram; the selected one grows and inverts to crema.
 * Drawn once as a bitmap by the map (`tracksViewChanges={false}`): its key must change with
 * `selected` for the new look to show.
 */
export function PlacePin({ category, selected }: PlacePinProps) {
  const { fill, ink } = categoryMeta(category).colors;
  const size = selected ? SELECTED_SIZE : SIZE;

  return (
    <View
      className="items-center justify-center rounded-full border-2"
      style={{
        width: size,
        height: size,
        backgroundColor: selected ? colors.background : fill,
        borderColor: selected ? fill : colors.background,
      }}
    >
      <CategoryIcon category={category} size={size * 0.55} color={selected ? fill : ink} />
    </View>
  );
}
