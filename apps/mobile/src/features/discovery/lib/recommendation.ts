import type { RouterOutputs } from '@/lib/trpc';

export type Recommendation = RouterOutputs['discovery']['recommendation'];
export type Destination = Recommendation['destinations'][number];

/** The destination to show, or null while the swipes are not telling enough ("Encore quelques swipes"). */
export function bestDestination(result: Recommendation | undefined): Destination | null {
  if (result?.status !== 'ok') return null;
  return result.destinations.at(0) ?? null;
}

export function confidencePercent(confidence: number): number {
  return Math.round(confidence * 100);
}

export function confidenceLabel(percent: number): string {
  if (percent >= 90) return 'Recommandation fiable';
  if (percent >= 50) return 'Tendance qui se confirme';
  return 'Première tendance';
}
