import { z } from 'zod';

/** Mirrored by the mobile app (`domain/trip.ts`), which can only import API types. */
export const TRIP_TITLE_MAX_LENGTH = 80;

export const tripTitleSchema = z
  .string()
  .trim()
  .min(1, 'Le titre ne peut pas être vide.')
  .max(
    TRIP_TITLE_MAX_LENGTH,
    `Le titre doit comporter au plus ${TRIP_TITLE_MAX_LENGTH} caractères.`,
  );

export const tripFormSchema = z.object({
  destination: z.string().min(1),
  startDate: z.string().min(1),
  durationDays: z.number().min(1),
  numberOfPeople: z.number().min(1).max(12),
  ages: z.array(z.union([z.number(), z.object({ value: z.number() }).transform((o) => o.value)])),
  intensity: z.enum(['chill', 'balanced', 'intense']),
  averagePrice: z.enum(['budget', 'mid', 'premium']),
  // No default: an omitted field must not wipe the interests seeded by the onboarding quiz.
  interests: z.array(z.string()).optional(),
  dietaryRestrictions: z
    .union([z.string(), z.array(z.string()).transform((arr) => arr.join(', '))])
    .optional()
    .nullable(),
  medicalConditions: z
    .union([z.string(), z.array(z.string()).transform((arr) => arr.join(', '))])
    .optional()
    .nullable(),
});

export type TripFormInput = z.infer<typeof tripFormSchema>;
