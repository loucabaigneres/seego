import { isPlaceCategory, type PlaceCategory } from '@/domain/place';
import { BedIcon, CompassIcon, ForkKnifeIcon, MapPinIcon, type AppIcon } from '@/ui/icons';

const CATEGORY_ICONS: Record<PlaceCategory, AppIcon> = {
  hotel: BedIcon,
  activité: CompassIcon,
  restaurant: ForkKnifeIcon,
};

/** Pictogram of a place category, for pins and filters; a plain pin for unknown ones. */
export function categoryIcon(category: string | null | undefined): AppIcon {
  return isPlaceCategory(category) ? CATEGORY_ICONS[category] : MapPinIcon;
}

export interface CategoryIconProps {
  category: string | null | undefined;
  size: number;
  color: string;
}

/** `categoryIcon`, rendered (filled). */
export function CategoryIcon({ category, size, color }: CategoryIconProps) {
  if (!isPlaceCategory(category)) return <MapPinIcon size={size} weight="fill" color={color} />;
  const Icon = CATEGORY_ICONS[category];
  return <Icon size={size} weight="fill" color={color} />;
}
