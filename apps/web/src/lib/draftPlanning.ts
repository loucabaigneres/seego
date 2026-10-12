import type { Day } from '../components/trip/types';

/** Moves a place one step up (`-1`) or down (`+1`) inside its day. */
export function moveWithinDay(
  days: Day[],
  dayId: string,
  activityId: string,
  offset: -1 | 1,
): Day[] {
  return days.map((day) => {
    if (day.id !== dayId) return day;
    const from = day.activities.findIndex((a) => a.id === activityId);
    const to = from + offset;
    if (from < 0 || to < 0 || to >= day.activities.length) return day;
    const activities = [...day.activities];
    [activities[from], activities[to]] = [activities[to]!, activities[from]!];
    return { ...day, activities };
  });
}

/** Moves a place to the end of another day. */
export function moveToDay(
  days: Day[],
  fromDayId: string,
  activityId: string,
  toDayId: string,
): Day[] {
  if (fromDayId === toDayId) return days;
  const moved = days.find((d) => d.id === fromDayId)?.activities.find((a) => a.id === activityId);
  if (!moved) return days;
  return days.map((day) => {
    if (day.id === fromDayId)
      return { ...day, activities: day.activities.filter((a) => a.id !== activityId) };
    if (day.id === toDayId) return { ...day, activities: [...day.activities, moved] };
    return day;
  });
}

export function removeFromDay(days: Day[], dayId: string, activityId: string): Day[] {
  return days.map((day) =>
    day.id === dayId
      ? { ...day, activities: day.activities.filter((a) => a.id !== activityId) }
      : day,
  );
}
