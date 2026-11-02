import type { RouterOutputs } from '@/lib/trpc';

export type TripData = RouterOutputs['discovery']['getTrip'];
export type Trip = TripData['trip'];
export type Day = TripData['days'][number];
export type Activity = Day['activities'][number];
