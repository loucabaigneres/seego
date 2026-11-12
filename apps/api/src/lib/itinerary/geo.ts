import { MISSING_COORDS_PENALTY } from './constants.js';
import type { GeoPoint, ItinItem } from './types.js';

const toRad = (d: number) => (d * Math.PI) / 180;

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

/** Compass bearing from one point to another, in radians over [0, 2π). */
export function bearing(fromLat: number, fromLng: number, toLat: number, toLng: number): number {
  const dLng = toRad(toLng - fromLng);
  const y = Math.sin(dLng) * Math.cos(toRad(toLat));
  const x =
    Math.cos(toRad(fromLat)) * Math.sin(toRad(toLat)) -
    Math.sin(toRad(fromLat)) * Math.cos(toRad(toLat)) * Math.cos(dLng);
  return (Math.atan2(y, x) + 2 * Math.PI) % (2 * Math.PI);
}

export function parseWkt(wkt: string | null): GeoPoint | null {
  if (!wkt) return null;
  const m = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i);
  if (!m) return null;
  return { lng: parseFloat(m[1]!), lat: parseFloat(m[2]!) };
}

/** Distance from an item to an anchor. Items without coordinates get a flat penalty. */
export function geoDistItem(item: Pick<ItinItem, 'lat' | 'lng'>, anchor: GeoPoint): number {
  if (item.lat == null || item.lng == null) return MISSING_COORDS_PENALTY;
  return haversine(item.lat, item.lng, anchor.lat, anchor.lng);
}

/** Barycentre of the items that have coordinates, or `fallback` if none do. */
export function centroid(items: ItinItem[], fallback: GeoPoint): GeoPoint {
  const pts = items.filter((i) => i.lat != null && i.lng != null);
  if (pts.length === 0) return fallback;
  return {
    lat: pts.reduce((s, i) => s + i.lat!, 0) / pts.length,
    lng: pts.reduce((s, i) => s + i.lng!, 0) / pts.length,
  };
}
