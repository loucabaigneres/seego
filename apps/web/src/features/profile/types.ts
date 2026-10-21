import type { RouterOutputs } from '@/lib/trpc';

export type Profile = RouterOutputs['user']['getProfile'];
export type ProfileTrip = RouterOutputs['user']['getTrips'][number];
export type ProfileTab = 'trips' | 'imports' | 'settings';
