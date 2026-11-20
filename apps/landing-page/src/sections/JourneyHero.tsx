import { lazy, Suspense, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { formatCoords, journeyAt, STOPS } from './journey';
import { Cross, LineReveal, ScrambleText } from './ui';

// three.js loads in its own chunk, the HUD renders right away.
const JourneyGlobe = lazy(() => import('./JourneyGlobe'));

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Pinned section: the page scroll flies a 3D globe from Paris through each destination
 * (the Igloo idea), framed like a Lusion hero, with a mono HUD around it.
 */
export function JourneyHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(0);
  const [failed, setFailed] = useState(false);

  // 0 when the section reaches the top, 1 when its end does: the sticky frame stays put meanwhile.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });

  useMotionValueEvent(scrollYProgress, 'change', (p) => setCurrent(journeyAt(p).current));

  const stop = STOPS[current];
  const isLast = current === STOPS.length - 1;

  return (
    <section ref={sectionRef} id="voyage" data-pinned className="relative h-[440vh]">
      <div className="sticky top-0 h-svh px-3 pb-3 pt-[4.5rem] sm:px-4 sm:pb-4">
        <div className="relative h-full overflow-hidden text-ink">
          {/* Globe: right two-thirds on desktop, top of the frame on mobile */}
          <div className="absolute inset-x-0 top-0 h-[50%] sm:h-[56%] lg:inset-y-0 lg:left-[36%] lg:h-full">
            {!failed && (
              <Suspense fallback={null}>
                <JourneyGlobe progress={scrollYProgress} onError={() => setFailed(true)} />
              </Suspense>
            )}
          </div>

          {/* Crop marks */}
          <Cross className="left-5 top-5 text-ink-muted" />
          <Cross className="right-5 top-5 text-ink-muted" />
          <Cross className="bottom-5 left-5 text-ink-muted" />
          <Cross className="bottom-5 right-5 text-ink-muted" />

          {/* HUD corners */}
          <div className="pointer-events-none absolute inset-x-10 top-5 flex justify-between tabular-nums text-[0.6rem] font-bold uppercase tracking-[0.25em] text-ink-muted">
            <span>
              Seego<span className="hidden sm:inline"> // Carnet de vol</span>
            </span>
            <span>
              Escale <ScrambleText text={String(current + 1).padStart(2, '0')} /> /{' '}
              {String(STOPS.length).padStart(2, '0')}
            </span>
          </div>

          {/* Current stop */}
          <div className="pointer-events-none absolute inset-x-6 top-[52%] z-10 sm:inset-x-10 sm:top-auto sm:bottom-24 lg:bottom-auto lg:top-1/2 lg:max-w-[48%] lg:-translate-y-1/2">
            <AnimatePresence mode="wait">
              <motion.div
                key={stop.name}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
              >
                <p className="tabular-nums text-[0.65rem] font-bold uppercase tracking-[0.25em] text-ink-muted">
                  {stop.country}
                </p>
                <h2 className="mt-3 text-[clamp(3rem,8vw,8rem)] font-display font-normal leading-[0.9] tracking-tight">
                  <LineReveal trigger="mount" lines={[stop.name]} />
                </h2>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.2 }}
                  className="mt-4 max-w-sm text-sm text-ink-muted sm:text-base"
                >
                  {stop.tagline}
                </motion.p>
                {isLast && (
                  <motion.a
                    href="#embarquement"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.35 }}
                    className="pointer-events-auto mt-6 inline-flex items-center gap-2 rounded-full bg-cta px-5 py-3 text-sm font-bold text-ink shadow-lg shadow-cta/30 transition hover:brightness-110"
                  >
                    Embarquer avec Seego
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </motion.a>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom HUD: coordinates and journey rail */}
          <div className="pointer-events-none absolute inset-x-10 bottom-5 flex items-end justify-between gap-6 tabular-nums text-[0.6rem] font-bold uppercase tracking-[0.25em] text-ink-muted">
            <ScrambleText text={formatCoords(stop)} className="hidden sm:inline" />
            <div className="flex flex-1 items-center gap-1.5 sm:max-w-xs" aria-hidden="true">
              {STOPS.map((s, i) => (
                <span
                  key={s.name}
                  className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                    i <= current ? 'bg-cta' : 'bg-line'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
