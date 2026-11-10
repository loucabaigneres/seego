import { colors } from '@seego/ui'
import { CAT_EMOJI, CAT_LABEL, catStyle } from '../lib/categories'

function FilterChip({
  label,
  active,
  activeStyle,
  onClick,
}: {
  label: string
  active: boolean
  activeStyle: React.CSSProperties
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition active:scale-95"
      style={
        active
          ? activeStyle
          : { background: colors.surface, borderColor: colors.line.strong, color: colors.ink.secondary }
      }
    >
      {label}
    </button>
  )
}

const SELECTED = { background: colors.brand, borderColor: colors.brand, color: colors.accent }

export interface TripFiltersProps {
  dayIndexes: number[]
  categories: string[]
  selectedDay: number | null
  selectedCategory: string | null
  onDayChange: (day: number | null) => void
  onCategoryChange: (category: string | null) => void
}

/** Day and category filters shared by the map and the day-by-day list. */
export function TripFilters({
  dayIndexes,
  categories,
  selectedDay,
  selectedCategory,
  onDayChange,
  onCategoryChange,
}: TripFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtres de l'itinéraire">
      <FilterChip
        label="Tous les jours"
        active={selectedDay === null}
        activeStyle={SELECTED}
        onClick={() => onDayChange(null)}
      />
      {dayIndexes.map((idx) => (
        <FilterChip
          key={idx}
          label={`Jour ${idx}`}
          active={selectedDay === idx}
          activeStyle={SELECTED}
          onClick={() => onDayChange(selectedDay === idx ? null : idx)}
        />
      ))}

      {categories.length > 0 && <span className="h-5 w-px shrink-0 bg-line-strong" aria-hidden />}

      {categories.map((c) => (
        <FilterChip
          key={c}
          label={`${CAT_EMOJI[c] ?? ''} ${CAT_LABEL[c] ?? c}`}
          active={selectedCategory === c}
          activeStyle={{
            background: catStyle(c).tint,
            borderColor: catStyle(c).ink,
            color: catStyle(c).ink,
          }}
          onClick={() => onCategoryChange(selectedCategory === c ? null : c)}
        />
      ))}
    </div>
  )
}
