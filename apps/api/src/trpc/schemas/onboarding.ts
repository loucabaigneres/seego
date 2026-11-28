import { z } from 'zod';

export const submitOnboardingSchema = z.object({
  landscapes: z
    .array(z.enum(['city', 'coast', 'nature', 'countryside']))
    .min(1, 'Sélectionne au moins un décor'),
  vibes: z
    .array(z.enum(['culture', 'food', 'outdoor', 'relax', 'nightlife']))
    .min(1, 'Sélectionne au moins une vibe'),
  travelWith: z
    .array(z.enum(['solo', 'couple', 'friends', 'family']))
    .min(1, 'Sélectionne au moins une compagnie'),
  climates: z.array(z.enum(['warm', 'mild', 'cold'])).min(1, 'Sélectionne au moins un climat'),
  guestId: z.string().optional(),
  /** Fill this trip (a group trip) instead of creating one. Signed-in owner only. */
  tripId: z.uuid().optional(),
});

export type SubmitOnboardingInput = z.infer<typeof submitOnboardingSchema>;
