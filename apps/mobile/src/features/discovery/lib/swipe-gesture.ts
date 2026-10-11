/** Horizontal distance, in px, past which a released card is swiped (same as the web). */
export const SWIPE_THRESHOLD = 110;

/** Speed, in px/s, at which a flick swipes the card before it reaches the threshold. */
const FLICK_VELOCITY = 800;

/** Share of the card width, on each side, where a tap browses the photos. */
const PHOTO_TAP_ZONE = 0.3;

/** What a released drag does: like (right), skip (left), or nothing (back to the centre). */
export function swipeOutcome(translationX: number, velocityX: number): 'like' | 'skip' | null {
  'worklet';
  if (translationX > SWIPE_THRESHOLD) return 'like';
  if (translationX < -SWIPE_THRESHOLD) return 'skip';
  // A flick only counts in the direction the card is already going.
  if (translationX > 0 && velocityX > FLICK_VELOCITY) return 'like';
  if (translationX < 0 && velocityX < -FLICK_VELOCITY) return 'skip';
  return null;
}

/** A tap on the left or right edge of the card shows the previous or next photo. */
export function photoTapTarget(ratio: number, photoCount: number): 'previous' | 'next' | null {
  if (photoCount < 2) return null;
  if (ratio < PHOTO_TAP_ZONE) return 'previous';
  if (ratio > 1 - PHOTO_TAP_ZONE) return 'next';
  return null;
}
