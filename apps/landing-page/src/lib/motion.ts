import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

// ── Shared scroll loop: one passive listener + one rAF for every subscriber ──

type FrameCallback = () => void;

const subscribers = new Set<FrameCallback>();
let ticking = false;

function flush() {
  ticking = false;
  subscribers.forEach((cb) => cb());
}

function schedule() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(flush);
}

/** Runs `cb` once now and on every animation frame following a scroll or resize. */
export function onScrollFrame(cb: FrameCallback) {
  if (subscribers.size === 0) {
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
  }
  subscribers.add(cb);
  cb();
  return () => {
    subscribers.delete(cb);
    if (subscribers.size === 0) {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    }
  };
}

export const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

// ── Reduced motion ──

const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(cb: () => void) {
  const mql = window.matchMedia(REDUCED_QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_QUERY).matches,
    () => false,
  );
}

// ── Reveal on scroll ──

/** Flips to `true` the first time the element enters the viewport. */
export function useInView<T extends Element>(options: IntersectionObserverInit = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const { rootMargin = '0px 0px -12% 0px', threshold = 0 } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, threshold]);

  return [ref, inView] as const;
}

// ── Parallax ──

/** Translates the element vertically by `speed` × page scroll (negative = moves up faster). */
export function useParallax<T extends HTMLElement | SVGElement>(speed: number) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return;
    return onScrollFrame(() => {
      // Only the first two viewports matter for hero decoration.
      const y = Math.min(window.scrollY, window.innerHeight * 2);
      el.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
    });
  }, [speed, reduced]);

  return ref;
}

/**
 * Reports how far the element has travelled through the viewport:
 * 0 when its top reaches `start` (fraction of viewport height), 1 when its bottom does.
 */
export function useScrollProgress<T extends HTMLElement>(
  onProgress: (progress: number, el: T) => void,
  start = 0.65,
) {
  const ref = useRef<T>(null);
  const cbRef = useRef(onProgress);

  useEffect(() => {
    cbRef.current = onProgress;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return onScrollFrame(() => {
      const rect = el.getBoundingClientRect();
      const anchor = window.innerHeight * start;
      cbRef.current(clamp((anchor - rect.top) / rect.height), el);
    });
  }, [start]);

  return ref;
}

// ── 3D tilt ──

/**
 * Tilts the element in 3D towards the pointer (mouse/trackpad only).
 * Exposes `--tilt-x` / `--tilt-y` (-1..1) so children can add their own depth effects.
 * Give the element a transform transition class for smoothing.
 */
export function useTilt<T extends HTMLElement>(maxDegrees = 10) {
  const ref = useRef<T>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let frame = 0;
    const apply = (x: number, y: number) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        el.style.transform = `perspective(1000px) rotateX(${(-y * maxDegrees).toFixed(2)}deg) rotateY(${(x * maxDegrees).toFixed(2)}deg)`;
        el.style.setProperty('--tilt-x', x.toFixed(3));
        el.style.setProperty('--tilt-y', y.toFixed(3));
      });
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const rect = el.getBoundingClientRect();
      apply(
        clamp(((e.clientX - rect.left) / rect.width) * 2 - 1, -1, 1),
        clamp(((e.clientY - rect.top) / rect.height) * 2 - 1, -1, 1),
      );
    };
    const onLeave = () => apply(0, 0);

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.style.transform = '';
    };
  }, [maxDegrees, reduced]);

  return ref;
}
