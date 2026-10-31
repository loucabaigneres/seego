import * as z from 'zod';

import { validate, type FieldErrors } from '@/features/auth/lib/validation';
import type { RouterInputs } from '@/lib/trpc';

export type TripConfigInput = RouterInputs['submitTripConfiguration'];
export type Intensity = TripConfigInput['intensity'];
export type AveragePrice = TripConfigInput['averagePrice'];
export type ConstraintList = 'dietary' | 'medical';

export const TRIP_CONFIG_STEPS = ['travelers', 'style', 'constraints'] as const;
export type TripConfigStep = (typeof TRIP_CONFIG_STEPS)[number];

export const DAYS_RANGE = { min: 1, max: 30 };
export const TRAVELERS_RANGE = { min: 1, max: 12 };
const MAX_AGE = 120;
const DEFAULT_AGE = '25';

export interface TripConfigValues {
  /** `YYYY-MM-DD`, null until picked. */
  startDate: string | null;
  durationDays: number;
  numberOfPeople: number;
  /** One per traveller, as typed. */
  ages: string[];
  intensity: Intensity;
  averagePrice: AveragePrice;
  dietary: string[];
  dietaryCustom: string;
  medical: string[];
  medicalCustom: string;
}

const AGE_ERROR = 'Indique l’âge de chaque voyageur.';
const age = z
  .string()
  .trim()
  .regex(/^\d{1,3}$/, AGE_ERROR)
  .transform(Number)
  .refine((value) => value <= MAX_AGE, AGE_ERROR);

/** Only the fields a person can get wrong: the others come from bounded controls. */
const tripConfigSchema = z.object({
  startDate: z.string().nullable().pipe(z.string('Choisis ta date de départ.')),
  ages: z.array(age),
});

export type TripConfigErrors = FieldErrors<z.input<typeof tripConfigSchema>>;

export interface TripConfigState {
  stepIndex: number;
  values: TripConfigValues;
  errors: TripConfigErrors;
}

type SettableField = Exclude<keyof TripConfigValues, 'numberOfPeople' | 'ages' | ConstraintList>;

export type TripConfigAction =
  | { [F in SettableField]: { type: 'set'; field: F; value: TripConfigValues[F] } }[SettableField]
  | { type: 'setTravelers'; count: number }
  | { type: 'setAge'; index: number; value: string }
  | { type: 'toggle'; list: ConstraintList; id: string }
  | { type: 'next' }
  | { type: 'back' };

// Same defaults as the web form.
export const initialTripConfigState: TripConfigState = {
  stepIndex: 0,
  values: {
    startDate: null,
    durationDays: 7,
    numberOfPeople: 1,
    ages: [DEFAULT_AGE],
    intensity: 'balanced',
    averagePrice: 'mid',
    dietary: [],
    dietaryCustom: '',
    medical: [],
    medicalCustom: '',
  },
  errors: {},
};

export function currentStep(state: TripConfigState): TripConfigStep {
  return TRIP_CONFIG_STEPS[state.stepIndex];
}

export function isLastStep(state: TripConfigState): boolean {
  return state.stepIndex === TRIP_CONFIG_STEPS.length - 1;
}

/** Share of the form reached, counting the current step (1/3 on the first one). */
export function tripConfigProgress(state: TripConfigState): number {
  return (state.stepIndex + 1) / TRIP_CONFIG_STEPS.length;
}

function toggle<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/** The options and the free text, comma-separated: the format the web sends. */
function joinConstraints(options: string[], custom: string): string {
  return [...options, custom.trim()].filter(Boolean).join(', ');
}

export function tripConfigReducer(
  state: TripConfigState,
  action: TripConfigAction,
): TripConfigState {
  const { values } = state;
  switch (action.type) {
    case 'set':
      return {
        ...state,
        values: { ...values, [action.field]: action.value },
        errors: { ...state.errors, [action.field]: undefined },
      };
    case 'setTravelers':
      // Keeps the ages already typed and fills the new travellers with the default.
      return {
        ...state,
        values: {
          ...values,
          numberOfPeople: action.count,
          ages: Array.from(
            { length: action.count },
            (_, index) => values.ages[index] ?? DEFAULT_AGE,
          ),
        },
        errors: { ...state.errors, ages: undefined },
      };
    case 'setAge':
      return {
        ...state,
        values: {
          ...values,
          ages: values.ages.map((current, index) =>
            index === action.index ? action.value : current,
          ),
        },
        errors: { ...state.errors, ages: undefined },
      };
    case 'toggle':
      return {
        ...state,
        values: { ...values, [action.list]: toggle(values[action.list], action.id) },
      };
    case 'next': {
      if (isLastStep(state)) return state;
      // Every fallible field is on the first step, so checking them all is checking this step.
      const result = validate(tripConfigSchema, values);
      if (!result.success) return { ...state, errors: result.errors };
      return { ...state, stepIndex: state.stepIndex + 1, errors: {} };
    }
    case 'back':
      if (state.stepIndex === 0) return state;
      return { ...state, stepIndex: state.stepIndex - 1 };
  }
}

/** The `submitTripConfiguration` input, or null while the form is incomplete. */
export function toSubmitInput(
  values: TripConfigValues,
  trip: { tripId: string; destination: string },
): TripConfigInput | null {
  const result = validate(tripConfigSchema, values);
  if (!result.success) return null;

  return {
    ...trip,
    startDate: result.data.startDate,
    ages: result.data.ages,
    durationDays: values.durationDays,
    numberOfPeople: values.numberOfPeople,
    intensity: values.intensity,
    averagePrice: values.averagePrice,
    dietaryRestrictions: joinConstraints(values.dietary, values.dietaryCustom),
    medicalConditions: joinConstraints(values.medical, values.medicalCustom),
  };
}
