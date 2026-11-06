import { lazy, Suspense, useRef, useState } from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react';
import { WaitlistForm } from '../components/WaitlistForm';
import { useScrub } from '../lib/useScrub';
import { formatCoords, journeyAt, STOPS } from './journey';
import { Cross, LineReveal, ScrambleText } from './ui';

// three.js loads in its own chunk, the HUD renders right away.
const JourneyGlobe = lazy(() => import('./JourneyGlobe'));

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

/**
 * Pinned hero: the page scroll flies a 3D globe from Paris through each destination
 * (the Igloo idea), framed like a Lusion hero, with a mono HUD around it.
 */
type JourneyHeroProps = {
  joinedEmail: string | null;
  onJoined: (email: string) => void;
};

export function JourneyHero({ joinedEmail, onJoined }: JourneyHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  // 0 when the section reaches the top, 1 when its end does: the sticky frame stays put meanwhile.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const introOpacity = useScrub(scrollYProgress, [0, 0.06], [1, 0]);
  const introY = useScrub(scrollYProgress, [0, 0.06], ['0%', '-12%']);

  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const { current: stop } = journeyAt(p);
    setCurrent(stop);
    setStarted(p > 0.05);
  });

  const stop = STOPS[current];
  const isLast = current === STOPS.length - 1;

  return (
    <section ref={sectionRef} id="top" data-pinned className="relative h-[440vh]">
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
          <Cross className="left-5 top-5 text-muted" />
          <Cross className="right-5 top-5 text-muted" />
          <Cross className="bottom-5 left-5 text-muted" />
          <Cross className="bottom-5 right-5 text-muted" />

          {/* HUD corners */}
          <div className="pointer-events-none absolute inset-x-10 top-5 flex justify-between font-mono text-[0.6rem] font-bold uppercase tracking-[0.25em] text-muted">
            <span>
              Seego<span className="hidden sm:inline"> // Carnet de vol</span>
            </span>
            <span>
              Escale <ScrambleText text={String(current + 1).padStart(2, '0')} /> /{' '}
              {String(STOPS.length).padStart(2, '0')}
            </span>
          </div>

          {/* Intro headline, fades as the flight starts */}
          <motion.div
            style={{ opacity: introOpacity, y: introY }}
            className="pointer-events-none absolute inset-x-6 bottom-16 z-10 sm:inset-x-10 sm:bottom-24 lg:bottom-auto lg:top-1/2 lg:max-w-[62%] lg:-translate-y-1/2"
          >
            <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.25em] text-accent">
              L’application mobile arrive bientôt
            </p>
            <h1 className="mt-4 text-[clamp(2.5rem,6vw,6.5rem)] font-extrabold leading-[0.95] tracking-tight">
              <LineReveal trigger="mount" delay={0.2} lines={['Ton prochain', 'voyage, en un']} />
              <LineReveal trigger="mount" delay={0.38} lines={['swipe.']} className="text-accent" />
            </h1>
            {/* Same waitlist as the boarding pass; clickable only until the flight starts */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.6 }}
              inert={started}
              className={`mt-8 *:mx-0 ${started ? '' : 'pointer-events-auto'}`}
            >
              <WaitlistForm
                joinedEmail={joinedEmail}
                onJoined={onJoined}
                position="hero"
                align="start"
              />
            </motion.div>
          </motion.div>

          {/* Current stop, once the flight has started */}
          <div className="pointer-events-none absolute inset-x-6 top-[52%] z-10 sm:inset-x-10 sm:top-auto sm:bottom-24 lg:bottom-auto lg:top-1/2 lg:max-w-[48%] lg:-translate-y-1/2">
            <AnimatePresence mode="wait">
              {started && (
                <motion.div
                  key={stop.name}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.35, ease: EASE_OUT }}
                >
                  <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.25em] text-muted">
                    {stop.country}
                  </p>
                  <h2 className="mt-3 text-[clamp(3rem,8vw,8rem)] font-extrabold leading-[0.9] tracking-tight">
                    <LineReveal trigger="mount" lines={[stop.name]} />
                  </h2>
                  <motion.p
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.2 }}
                    className="mt-4 max-w-sm text-sm text-muted sm:text-base"
                  >
                    {stop.tagline}
                  </motion.p>
                  {isLast && (
                    <motion.a
                      href="#embarquement"
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.35 }}
                      className="pointer-events-auto mt-6 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white shadow-lg shadow-accent/30 transition hover:brightness-110"
                    >
                      Embarquer avec Seego
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </motion.a>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom HUD: coordinates, journey rail, scroll hint */}
          <div className="pointer-events-none absolute inset-x-10 bottom-5 flex items-end justify-between gap-6 font-mono text-[0.6rem] font-bold uppercase tracking-[0.25em] text-muted">
            <ScrambleText text={formatCoords(stop)} className="hidden sm:inline" />
            <div className="flex flex-1 items-center gap-1.5 sm:max-w-xs" aria-hidden="true">
              {STOPS.map((s, i) => (
                <span
                  key={s.name}
                  className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                    i <= current ? 'bg-accent' : 'bg-line'
                  }`}
                />
              ))}
            </div>
            <motion.span
              style={{ opacity: introOpacity }}
              className="flex items-center gap-1.5 text-ink/70"
            >
              Scroll pour décoller
              <ArrowDown className="h-3 w-3 animate-bounce" aria-hidden="true" />
            </motion.span>
          </div>
        </div>
      </div>
    </section>
  );
}
