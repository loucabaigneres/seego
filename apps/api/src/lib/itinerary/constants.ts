import type { AveragePrice, Intensity } from './types.js';

// ─── Tuning constants ─────────────────────────────────────────────────────────

/** `budget` -> `$`, `mid` -> `$$`, `premium` -> `$$$$` (the catalog goes up to 4 tiers). */
export const PRICE_TARGET_RANK: Record<AveragePrice, number> = { budget: 1, mid: 2, premium: 4 };

/** How many activities a day holds, per trip pace. */
export const INTENSITY_ACTS_PER_DAY: Record<Intensity, number> = {
  chill: 1,
  balanced: 2,
  intense: 3,
};

/** Km-equivalent cost of drifting one price tier away from the trip's budget. */
export const PRICE_PENALTY_PER_TIER = 8;

/**
 * Km-equivalent cost of missing coordinates. Without it such items score as if
 * they sat exactly on the anchor and win every single pick.
 */
export const MISSING_COORDS_PENALTY = 50;

/** Km-equivalent bonus per matched interest, and how many matches can count. */
export const INTEREST_BONUS = 10;
export const MAX_COUNTED_INTERESTS = 2;

/** Km-equivalent bonus for a place the user liked during the swipe flow. */
export const LIKED_BONUS = 25;

export const MAX_ALTERNATIVE_HOTELS = 3;
/** Alternatives must be this far apart, otherwise they are the same offer twice. */
export const MIN_ALTERNATIVE_SEPARATION_KM = 1;

/** A place may be reused only after this many days have passed. */
export const REUSE_COOLDOWN_DAYS = 3;

export const DEFAULT_REPLACEMENT_LIMIT = 6;

// ─── Interest keywords ────────────────────────────────────────────────────────

const GASTRONOMY_KEYWORDS = [
  'gastronomi',
  'marche',
  'bistro',
  'tapas',
  'degustation',
  'cave',
  'vin',
  'culinaire',
];
const NATURE_KEYWORDS = [
  'parc',
  'jardin',
  'plage',
  'nature',
  'lac',
  'randonnee',
  'botanique',
  'foret',
];
const ADVENTURE_KEYWORDS = [
  'aventure',
  'sport',
  'kayak',
  'velo',
  'escalade',
  'plongee',
  'excursion',
  'surf',
];

/**
 * The catalog's subcategories describe amenities (`spa`, `rooftop`, `plage`, ...)
 * and do not line up with the interests offered by the trip form and the
 * onboarding quiz, so interests are matched by keyword over the item's text instead.
 */
export const INTEREST_KEYWORDS: Record<string, string[]> = {
  culture: [
    'musee',
    'monument',
    'cathedrale',
    'eglise',
    'chateau',
    'historique',
    'art',
    'galerie',
    'exposition',
    'patrimoine',
  ],
  gastronomy: GASTRONOMY_KEYWORDS,
  nature: NATURE_KEYWORDS,
  adventure: ADVENTURE_KEYWORDS,
  nightlife: ['bar', 'rooftop', 'club', 'cocktail', 'discotheque', 'nuit', 'nocturne'],
  // Onboarding quiz vibes, seeded into `trip.interests` by `onboarding.submit`.
  food: GASTRONOMY_KEYWORDS,
  outdoor: [...NATURE_KEYWORDS, ...ADVENTURE_KEYWORDS],
  relax: ['spa', 'bien-etre', 'detente', 'massage', 'hammam', 'thermes', 'plage', 'croisiere'],
};
