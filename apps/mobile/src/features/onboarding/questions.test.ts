// Icons are ESM-only and irrelevant to the labels.
jest.mock('@/ui/icons', () => ({}));

import { answerLabels } from './questions';

describe('answerLabels', () => {
  it('keeps quiz order and shortens titles before " & "', () => {
    expect(
      answerLabels({
        landscapes: ['coast', 'city'],
        vibes: [],
        travelWith: ['couple'],
        climates: ['warm'],
      }),
    ).toEqual(['Cité vibrante', 'Littoral', 'En couple', 'Grand soleil']);
  });
});
