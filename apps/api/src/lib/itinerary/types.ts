export type ItinItem = {
  activityId: string;
  discoveryContentId: string | null;
  title: string;
  locationName: string | null;
  description: string | null;
  coordinates: string | null;
  lat: number | null;
  lng: number | null;
  mainMediaUrl: string | null;
  category: string;
  price: string | null;
  subcategory: string[] | null;
  /** True when the user explicitly liked this place during the swipe flow. */
  liked: boolean;
};

export type Intensity = 'chill' | 'balanced' | 'intense';
export type AveragePrice = 'budget' | 'mid' | 'premium';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ScoreContext {
  targetPriceRank: number;
  interests: string[];
}
