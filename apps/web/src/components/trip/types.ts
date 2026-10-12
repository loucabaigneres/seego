import type { inferRouterOutputs } from '@trpc/server';
import type { AppRouter } from '../../../../api/src/trpc/router';

type RouterOutputs = inferRouterOutputs<AppRouter>;
export type TripData = RouterOutputs['discovery']['getTrip'];
export type Trip = TripData['trip'];
export type Day = TripData['days'][number];
export type Activity = Day['activities'][number];
