import {
  bestDestination,
  confidenceLabel,
  confidencePercent,
  type Destination,
  type Recommendation,
} from './recommendation';

const rome = { city: 'Rome' } as Destination;
const result = (status: Recommendation['status'], destinations: Destination[]) =>
  ({ status, confidence: 0.5, destinations }) as Recommendation;

describe('bestDestination', () => {
  it('returns the first destination when the result is ok', () => {
    expect(bestDestination(result('ok', [rome, { city: 'Lisbonne' } as Destination]))).toBe(rome);
  });

  it('returns null when the swipes are not telling enough', () => {
    expect(bestDestination(undefined)).toBeNull();
    expect(bestDestination(result('no_data', [rome]))).toBeNull();
    expect(bestDestination(result('inconclusive', [rome]))).toBeNull();
    expect(bestDestination(result('ok', []))).toBeNull();
  });
});

describe('confidence', () => {
  it('rounds to a percentage', () => {
    expect(confidencePercent(0.876)).toBe(88);
  });

  it('labels each threshold', () => {
    expect(confidenceLabel(49)).toBe('Première tendance');
    expect(confidenceLabel(50)).toBe('Tendance qui se confirme');
    expect(confidenceLabel(89)).toBe('Tendance qui se confirme');
    expect(confidenceLabel(90)).toBe('Recommandation fiable');
  });
});
