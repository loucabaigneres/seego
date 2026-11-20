import { ScrollView } from 'react-native';

import { categoryMeta } from '@/domain/place';
import { Chip } from '@/ui';

import { categoryIcon } from './category-icons';

export interface CategoryFilterProps {
  categories: string[];
  /** The one category shown, or null for all of them. */
  selected: string | null;
  onToggle: (category: string) => void;
}

/** Shows a single category on the map; tapping the selected chip again shows them all. */
export function CategoryFilter({ categories, selected, onToggle }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="-mx-6 grow-0"
      contentContainerClassName="gap-2 px-6"
    >
      {categories.map((category) => (
        <Chip
          key={category}
          label={categoryMeta(category).label}
          icon={categoryIcon(category)}
          selected={category === selected}
          onPress={() => onToggle(category)}
        />
      ))}
    </ScrollView>
  );
}
