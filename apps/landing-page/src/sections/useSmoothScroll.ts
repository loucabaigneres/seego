import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { useReducedMotion } from 'motion/react';

/**
 * Inertial smooth scrolling (Lenis). It still moves the native scroll position,
 * so motion's `useScroll` and sticky sections keep working as usual.
 * The page always opens on the hero: reloading mid-page starts back at the top.
 */
const HEADER = 72; // fixed header height (h-[4.5rem])

export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);
  const reduced = useReducedMotion();

  // Land on the globe, not wherever the browser would restore the scroll to.
  useEffect(() => {
    const restoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => {
      history.scrollRestoration = restoration;
    };
  }, []);

  useEffect(() => {
    if (reduced) return;
    const root = document.documentElement;
    // CSS smooth scrolling fights with Lenis.
    const previous = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';

    // Higher lerp = catches up faster (less floaty); the multiplier covers more ground per wheel notch.
    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.12,
      wheelMultiplier: 1.2,
      touchMultiplier: 1.25,
    });
    lenisRef.current = lenis;

    // In-page links (side dots, logo, CTAs). Lenis' own `anchors` option scrolls without
    // cancelling the browser's jump, so both fought and links landed in the wrong place.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const id = link?.getAttribute('href')?.slice(1);
      const target = id ? document.getElementById(id) : null;
      if (!target) return;
      event.preventDefault();
      // Pinned sections (data-pinned) land flush so they lock straight away; the others stop
      // just under the fixed header.
      const top = target.getBoundingClientRect().top + window.scrollY;
      lenis.scrollTo(Math.max(0, top - (target.hasAttribute('data-pinned') ? 0 : HEADER)), {
        duration: 1.4,
      });
    };
    document.addEventListener('click', onClick);

    return () => {
      document.removeEventListener('click', onClick);
      lenis.destroy();
      lenisRef.current = null;
      root.style.scrollBehavior = previous;
    };
  }, [reduced]);

  return lenisRef;
}
