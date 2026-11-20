import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PlaneTakeoff } from 'lucide-react';
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { useScrub } from '../lib/useScrub';
import { Reveal } from './Reveal';

type Departure = {
  flight: string;
  city: string;
  country: string;
  time: string;
  status: string;
  live?: boolean;
};

const DEPARTURES: Departure[] = [
  {
    flight: 'SG 128',
    city: 'LISBONNE',
    country: 'Portugal',
    time: '07:45',
    status: 'EMBARQUEMENT',
    live: true,
  },
  { flight: 'SG 342', city: 'ROME', country: 'Italie', time: '09:10', status: 'À L’HEURE' },
  { flight: 'SG 507', city: 'BARCELONE', country: 'Espagne', time: '11:30', status: 'À L’HEURE' },
  {
    flight: 'SG 219',
    city: 'REYKJAVIK',
    country: 'Islande',
    time: '14:05',
    status: 'COUP DE CŒUR',
  },
  { flight: 'SG 664', city: 'PRAGUE', country: 'Tchéquie', time: '16:50', status: 'TENDANCE' },
];

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const FLIP_MS = 70;

/** Split-flap style text: letters shuffle before settling once `run` is true. */
function FlapText({ text, run, delay = 0 }: { text: string; run: boolean; delay?: number }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(text.replace(/\S/g, ' '));

  useEffect(() => {
    if (!run || reduced) return;
    const start = performance.now() + delay;
    let frame = 0;
    let lastStep = -1;
    const tick = (now: number) => {
      const elapsed = now - start;
      // Flip at a steady cadence so each 3D flap has time to play.
      const step = Math.floor(elapsed / FLIP_MS);
      if (step === lastStep) {
        frame = requestAnimationFrame(tick);
        return;
      }
      lastStep = step;
      let done = true;
      const next = [...text]
        .map((char, i) => {
          // Each letter settles a little after the previous one.
          if (char === ' ' || elapsed > 220 + i * 55) return char;
          done = false;
          return elapsed < 0 ? ' ' : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join('');
      setShown(next);
      if (!done) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [run, text, delay, reduced]);

  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="whitespace-pre perspective-[300px]">
        {[...(reduced && run ? text : shown)].map((char, i) => (
          // Re-keying on each new glyph replays the flip.
          <span key={`${i}-${char}`} className="animate-flap inline-block origin-[50%_60%]">
            {char}
          </span>
        ))}
      </span>
    </>
  );
}

const ROW_CLASS =
  'grid grid-cols-[4.5rem_1fr_auto] items-center gap-x-3 rounded-xl bg-ink-inverse/[0.04] px-3 py-3 tabular-nums text-sm font-bold tracking-wider text-ink-inverse sm:grid-cols-[6rem_1fr_5rem_9rem] sm:px-4 sm:text-base';

/** A board row that slides in from alternating sides as the board scrolls into place. */
function ScrollRow({
  progress,
  index,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  children: ReactNode;
}) {
  const start = 0.3 + index * 0.08;
  const x = useScrub(progress, [start, start + 0.3], [index % 2 ? 80 : -80, 0]);
  const opacity = useScrub(progress, [start, start + 0.25], [0, 1]);
  return (
    <motion.li style={{ x, opacity }} className={ROW_CLASS}>
      {children}
    </motion.li>
  );
}

/** Departures board whose entrance follows the scroll: a plane takes off, the board tilts up, rows slide in. */
export function DeparturesBoard() {
  const sectionRef = useRef<HTMLElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(boardRef, { once: true, margin: '0px 0px -20% 0px' });

  // 0 when the section top enters the screen, 1 when the board sits in the middle.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'center center'],
  });
  const boardRotateX = useScrub(scrollYProgress, [0.2, 0.9], [32, 0]);
  const boardScale = useScrub(scrollYProgress, [0.2, 0.9], [0.86, 1]);
  const boardY = useScrub(scrollYProgress, [0.2, 0.9], [120, 0]);
  // Take-off: rolls along the runway, then climbs out of the frame.
  const planeLeft = useScrub(scrollYProgress, [0, 0.8], ['0%', '100%']);
  const planeY = useTransform(scrollYProgress, (p) => -(Math.max(0, (p - 0.35) / 0.45) ** 2) * 70);
  // Nose lifts as it leaves the runway, then the plane fades out before reaching the title.
  const planeRotate = useTransform(
    scrollYProgress,
    (p) => -18 * Math.min(1, Math.max(0, (p - 0.35) / 0.12)),
  );
  const planeOpacity = useScrub(scrollYProgress, [0.72, 0.85], [1, 0]);

  const rows = DEPARTURES.map((d, row) => (
    <>
      <span className="text-ink-inverse/60">
        <FlapText text={d.flight} run={inView} delay={row * 140} />
      </span>
      <span className="min-w-0 truncate">
        <FlapText text={d.city} run={inView} delay={row * 140 + 80} />
        <span className="ml-2 hidden font-sans text-xs font-medium tracking-normal text-ink-inverse/60 md:inline">
          {d.country}
        </span>
      </span>
      <span className="hidden text-cta sm:block">
        <FlapText text={d.time} run={inView} delay={row * 140 + 160} />
      </span>
      <span
        className={`text-right text-[0.65rem] sm:text-left sm:text-xs ${
          d.live ? 'animate-blink text-cta' : 'text-ink-inverse/60'
        }`}
      >
        <FlapText text={d.status} run={inView} delay={row * 140 + 240} />
      </span>
    </>
  ));

  const board = (
    <div
      ref={boardRef}
      className="overflow-hidden rounded-3xl bg-ink p-2 shadow-2xl shadow-ink/20 sm:p-3"
    >
      <div className="grid grid-cols-[4.5rem_1fr_auto] gap-x-3 px-3 pb-2 pt-1 tabular-nums text-[0.6rem] font-bold uppercase tracking-[0.2em] text-ink-inverse/60 sm:grid-cols-[6rem_1fr_5rem_9rem] sm:px-4">
        <span>Vol</span>
        <span>Destination</span>
        <span className="hidden sm:block">Heure</span>
        <span className="text-right sm:text-left">Statut</span>
      </div>

      <ul className="space-y-1.5">
        {DEPARTURES.map((d, row) => (
          <ScrollRow key={d.flight} progress={scrollYProgress} index={row}>
            {rows[row]}
          </ScrollRow>
        ))}
      </ul>
    </div>
  );

  return (
    <section ref={sectionRef} id="departs" className="relative border-t border-line/60">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-bold text-ink-muted">
            <PlaneTakeoff className="h-3.5 w-3.5 text-brand" />
            Inspirations du moment
          </span>
          <h2 className="mt-4 text-3xl font-display font-normal tracking-tight text-ink sm:text-4xl">
            Prochains départs.
          </h2>
          <p className="mt-3 text-base text-ink-muted">
            Les destinations qui font swiper la communauté en ce moment.
          </p>
        </Reveal>

        {/* Runway with a plane taking off as you scroll */}
        <div className="relative mx-auto mt-10 h-10 max-w-2xl" aria-hidden="true">
          <span className="absolute inset-x-0 bottom-2 border-t-2 border-dashed border-line" />
          <motion.span
            style={{ left: planeLeft, y: planeY, rotate: planeRotate, opacity: planeOpacity }}
            className="absolute bottom-0 -translate-x-1/2 text-brand"
          >
            <PlaneTakeoff className="h-7 w-7" />
          </motion.span>
        </div>
        <div className="mt-6 [perspective:1200px]">
          <motion.div
            style={{ rotateX: boardRotateX, scale: boardScale, y: boardY }}
            className="origin-bottom"
          >
            {board}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
