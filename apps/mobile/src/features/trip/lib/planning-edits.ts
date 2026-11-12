import { inPlanningOrder } from '@/domain/trip';

/** Pure edits of a planning draft: the itinerary days, each in its edited order. */
interface DraftDay<Activity extends { id: string }> {
  id: string;
  activities: Activity[];
}

/** Moves a place one step up (`-1`) or down (`+1`) inside its day. */
export function moveWithinDay<Day extends DraftDay<{ id: string }>>(
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
export function moveToDay<Day extends DraftDay<{ id: string }>>(
  days: Day[],
  fromDayId: string,
  activityId: string,
  toDayId: string,
): Day[] {
  if (fromDayId === toDayId) return days;
  const moved = days.find((d) => d.id === fromDayId)?.activities.find((a) => a.id === activityId);
  if (!moved || !days.some((d) => d.id === toDayId)) return days;
  return days.map((day) => {
    if (day.id === fromDayId)
      return { ...day, activities: day.activities.filter((a) => a.id !== activityId) };
    if (day.id === toDayId) return { ...day, activities: [...day.activities, moved] };
    return day;
  });
}

export function removeFromDay<Day extends DraftDay<{ id: string }>>(
  days: Day[],
  dayId: string,
  activityId: string,
): Day[] {
  return days.map((day) =>
    day.id === dayId
      ? { ...day, activities: day.activities.filter((a) => a.id !== activityId) }
      : day,
  );
}

/** A fresh draft: every itinerary day in the planner's order. */
export function toDraft<Day extends DraftDay<{ id: string; orderIndex: number }>>(
  itinerary: Day[],
): Day[] {
  return itinerary.map((day) => ({ ...day, activities: inPlanningOrder(day.activities) }));
}

/** `discovery.updatePlanning` input: the full target state of every planning day. */
export function toPlanningInput(tripId: string, draft: DraftDay<{ id: string }>[]) {
  return {
    tripId,
    days: draft.map((day) => ({ dayId: day.id, activityIds: day.activities.map((a) => a.id) })),
  };
}

/** Whether the draft differs from the saved itinerary (order, day or removal). */
export function isDraftDirty<Day extends DraftDay<{ id: string; orderIndex: number }>>(
  draft: DraftDay<{ id: string }>[],
  itinerary: Day[],
): boolean {
  const key = (days: DraftDay<{ id: string }>[]) =>
    JSON.stringify(days.map((day) => [day.id, day.activities.map((a) => a.id)]));
  return key(draft) !== key(toDraft(itinerary));
}

/** The hotel is shared by the whole stay: it can be reordered or replaced, not moved or removed. */
export function canRelocate(activity: { category: string | null }): boolean {
  return activity.category !== 'hotel';
}
