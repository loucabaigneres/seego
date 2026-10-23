import type { RouterOutputs } from '@/lib/trpc';

// ─── Types derived from the tRPC router (single source of truth) ───────────────
export type RecommendationOutput = RouterOutputs['discovery']['recommendation'];
export type SaveTripOutput = RouterOutputs['discovery']['saveTrip'];
export type DiscoveryItem = RouterOutputs['discovery']['feed'][number];
export type CityRank = RouterOutputs['discovery']['rankCities'][number];
export type Destination = RecommendationOutput['destinations'][number];
export type LikedPlace = Destination['likedHere'][number];
export type Subcategory = Destination['topSubcategories'][number];

export interface SaveState {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  data: SaveTripOutput | undefined;
}

export interface SwipeEntry {
  id: string;
  liked: boolean;
  viewDurationMs: number | null;
}

export interface DragState {
  x: number;
  y: number;
  active: boolean;
}

export type LeavingDirection = 'like' | 'skip';
