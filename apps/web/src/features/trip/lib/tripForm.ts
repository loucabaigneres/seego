import { z } from 'zod';

export const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Végétarien' },
  { id: 'vegan', label: 'Végan' },
  { id: 'gluten_free', label: 'Sans gluten' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Casher' },
] as const;

export const MEDICAL_OPTIONS = [
  { id: 'reduced_mobility', label: 'Mobilité réduite' },
  { id: 'pregnancy', label: 'Grossesse' },
  { id: 'asthma', label: 'Asthme / Problèmes respiratoires' },
  { id: 'vertigo', label: 'Vertige sévère' },
] as const;

/** Most travelers a trip can have (same cap as the mobile app). */
export const MAX_TRAVELERS = 12;
/** Longest trip the planner can build (it clamps to 14 days). */
export const MAX_TRIP_DAYS = 14;

const toUtc = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};

/** Adds `days` to an ISO date (`YYYY-MM-DD`). */
export function addDays(iso: string, days: number): string {
  return new Date(toUtc(iso) + days * 86_400_000).toISOString().slice(0, 10);
}

/** Number of days of a trip from `startDate` to `endDate`, both included. */
export function tripDurationDays(startDate: string, endDate: string): number {
  return Math.round((toUtc(endDate) - toUtc(startDate)) / 86_400_000) + 1;
}

export const tripFormSchema = z
  .object({
    destination: z.string().min(1, 'La destination est requise'),
    startDate: z.string().min(1, 'La date de départ est requise'),
    endDate: z.string().min(1, 'La date de retour est requise'),
    numberOfPeople: z
      .number()
      .min(1, 'Au moins un voyageur requis')
      .max(MAX_TRAVELERS, `${MAX_TRAVELERS} voyageurs maximum`),
    ages: z.array(z.object({ value: z.number() })),
    intensity: z.enum(['chill', 'balanced', 'intense']),
    averagePrice: z.enum(['budget', 'mid', 'premium']),
    dietaryOptions: z.array(z.string()).default([]),
    dietaryCustom: z.string().optional(),
    medicalOptions: z.array(z.string()).default([]),
    medicalCustom: z.string().optional(),
  })
  .refine((v) => !v.startDate || !v.endDate || v.endDate >= v.startDate, {
    path: ['endDate'],
    message: 'Le retour doit être après le départ',
  })
  .refine(
    (v) => !v.startDate || !v.endDate || tripDurationDays(v.startDate, v.endDate) <= MAX_TRIP_DAYS,
    {
      path: ['endDate'],
      message: `Un voyage dure ${MAX_TRIP_DAYS} jours maximum`,
    },
  );

export type TripFormValues = z.infer<typeof tripFormSchema>;

type StoredTrip = {
  destination?: string | null;
  startDate?: string | null;
  durationDays?: number | null;
  numberOfPeople?: number | null;
  ages?: unknown;
  intensity?: string | null;
  averagePrice?: string | null;
  dietaryRestrictions?: string | null;
  medicalConditions?: string | null;
};

/** Splits a stored "id, id, free text" string back into the known option ids and the free text. */
function splitOptions(stored: string | null | undefined, options: readonly { id: string }[]) {
  const ids = new Set(options.map((option) => option.id));
  const parts = (stored ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return {
    options: parts.filter((part) => ids.has(part)),
    custom: parts.filter((part) => !ids.has(part)).join(', '),
  };
}

/** Rebuilds the form answers from the trip row they were saved to, so going back never loses them. */
export function tripToFormValues(trip: StoredTrip): Partial<TripFormValues> {
  const dietary = splitOptions(trip.dietaryRestrictions, DIETARY_OPTIONS);
  const medical = splitOptions(trip.medicalConditions, MEDICAL_OPTIONS);
  const ages = Array.isArray(trip.ages)
    ? trip.ages.filter((age): age is number => typeof age === 'number').map((value) => ({ value }))
    : [];

  return {
    ...(trip.destination ? { destination: trip.destination } : {}),
    startDate: trip.startDate ?? '',
    endDate:
      trip.startDate && trip.durationDays ? addDays(trip.startDate, trip.durationDays - 1) : '',
    ...(trip.numberOfPeople ? { numberOfPeople: trip.numberOfPeople } : {}),
    ...(ages.length > 0 ? { ages } : {}),
    ...(trip.intensity ? { intensity: trip.intensity as TripFormValues['intensity'] } : {}),
    ...(trip.averagePrice
      ? { averagePrice: trip.averagePrice as TripFormValues['averagePrice'] }
      : {}),
    dietaryOptions: dietary.options,
    dietaryCustom: dietary.custom,
    medicalOptions: medical.options,
    medicalCustom: medical.custom,
  };
}
