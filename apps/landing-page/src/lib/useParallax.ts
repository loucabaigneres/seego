import { useReducedMotion, useScroll, useTransform } from 'motion/react';

// Only the first screens of the page matter for hero decoration.
const MAX_SCROLL = 1600;

/** Vertical offset following page scroll × `speed` (negative = moves up faster). Use as `style={{ y }}`. */
export function useParallax(speed: number) {
  const { scrollY } = useScroll();
  const reduced = useReducedMotion();
  return useTransform(scrollY, (v) => (reduced ? 0 : Math.min(v, MAX_SCROLL) * speed));
}
