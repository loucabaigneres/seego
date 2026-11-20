import type { Day } from '../types';

/** Applies the day / category filters to the day-by-day list (days left empty are hidden). */
export function filterDays(days: Day[], day: number | null, category: string | null): Day[] {
  return days
    .filter((d) => day === null || d.dayIndex === day)
    .map((d) =>
      category === null
        ? d
        : { ...d, activities: d.activities.filter((a) => a.category === category) },
    )
    .filter((d) => category === null || d.activities.length > 0);
}
