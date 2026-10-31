/** Horizontal distance, in px, past which a released card is swiped (same as the web). */
export const SWIPE_THRESHOLD = 110;

/** Speed, in px/s, at which a flick swipes the card (or opens its details) before the threshold. */
const FLICK_VELOCITY = 800;

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

/**
 * What a drag controls, decided once when it starts: an expanded card only opens or closes
 * its details; a collapsed one opens them when dragged up, and is swiped otherwise.
 */
export function dragIntent(
  translationX: number,
  translationY: number,
  isExpanded: boolean,
): 'swipe' | 'expand' {
  'worklet';
  if (isExpanded) return 'expand';
  return -translationY > Math.abs(translationX) ? 'expand' : 'swipe';
}

/** Where a released details drag settles: a flick decides, otherwise the nearest side. */
export function settlesExpanded(expansion: number, velocityY: number): boolean {
  'worklet';
  if (velocityY < -FLICK_VELOCITY) return true;
  if (velocityY > FLICK_VELOCITY) return false;
  return expansion > 0.5;
}

/**
 * A tap on the left or right half shows the previous or next photo (Tinder-like).
 * Taps never open the details: only the upward drag and the ⓘ button do, so they can't be confused.
 */
export function photoTapTarget(ratio: number, photoCount: number): 'previous' | 'next' | null {
  if (photoCount < 2) return null;
  return ratio < 0.5 ? 'previous' : 'next';
}
