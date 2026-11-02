import type { Segment } from '@/ui';

import type { AveragePrice, ConstraintList, Intensity, TripConfigStep } from './lib/trip-config';

export const STEP_COPY: Record<TripConfigStep, { title: string; subtitle: string }> = {
  travelers: {
    title: 'Les bases du voyage',
    subtitle: 'Quand pars-tu, combien de temps, et avec qui ?',
  },
  style: {
    title: 'Le rythme et le budget',
    subtitle: 'On cale le programme sur ton allure et ton budget.',
  },
  constraints: {
    title: 'Les derniers détails',
    subtitle: 'Tout est facultatif : dis-nous seulement ce qui compte pour toi.',
  },
};

export interface ChoiceOption<T extends string> extends Segment<T> {
  hint: string;
}

export const INTENSITY_OPTIONS: ChoiceOption<Intensity>[] = [
  { value: 'chill', label: 'Relax', hint: 'Tu prends ton temps.' },
  { value: 'balanced', label: 'Équilibré', hint: 'Un peu de tout, sans courir.' },
  { value: 'intense', label: 'Intense', hint: 'Tu explores un max.' },
];

export const BUDGET_OPTIONS: ChoiceOption<AveragePrice>[] = [
  { value: 'budget', label: 'Petit', hint: 'Les bons plans avant tout.' },
  { value: 'mid', label: 'Moyen', hint: 'Un budget raisonnable.' },
  { value: 'premium', label: 'Premium', hint: 'Tu te fais plaisir.' },
];

export interface ConstraintGroup {
  title: string;
  /** Ids are the ones the web sends, so both clients store the same values. */
  options: { id: string; label: string }[];
  customLabel: string;
  customPlaceholder: string;
}

export const CONSTRAINT_GROUPS: Record<ConstraintList, ConstraintGroup> = {
  dietary: {
    title: 'Restrictions alimentaires',
    options: [
      { id: 'vegetarian', label: 'Végétarien' },
      { id: 'vegan', label: 'Végan' },
      { id: 'gluten_free', label: 'Sans gluten' },
      { id: 'halal', label: 'Halal' },
      { id: 'kosher', label: 'Casher' },
    ],
    customLabel: 'Autre chose à préciser ?',
    customPlaceholder: 'Ex. : allergie aux arachides',
  },
  medical: {
    title: 'Conditions médicales',
    options: [
      { id: 'reduced_mobility', label: 'Mobilité réduite' },
      { id: 'pregnancy', label: 'Grossesse' },
      { id: 'asthma', label: 'Asthme / problèmes respiratoires' },
      { id: 'vertigo', label: 'Vertige sévère' },
    ],
    customLabel: 'Un besoin spécifique ?',
    customPlaceholder: 'Ex. : problèmes de dos',
  },
};
