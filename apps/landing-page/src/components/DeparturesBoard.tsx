import { useEffect, useState } from 'react';
import { PlaneTakeoff } from 'lucide-react';
import { useInView, usePrefersReducedMotion, useTilt } from '../lib/motion';
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
  { flight: 'SG 342', city: 'KYOTO', country: 'Japon', time: '09:10', status: 'À L’HEURE' },
  { flight: 'SG 507', city: 'MARRAKECH', country: 'Maroc', time: '11:30', status: 'À L’HEURE' },
  {
    flight: 'SG 219',
    city: 'REYKJAVIK',
    country: 'Islande',
    time: '14:05',
    status: 'COUP DE CŒUR',
  },
  { flight: 'SG 664', city: 'OAXACA', country: 'Mexique', time: '16:50', status: 'TENDANCE' },
];

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const FLIP_MS = 70;

/** Split-flap style text: letters shuffle before settling once `run` is true. */
function FlapText({ text, run, delay = 0 }: { text: string; run: boolean; delay?: number }) {
  const reduced = usePrefersReducedMotion();
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

export function DeparturesBoard() {
  const [boardRef, inView] = useInView<HTMLDivElement>({ rootMargin: '0px 0px -20% 0px' });
  const tilt = useTilt<HTMLDivElement>(3);

  return (
    <section id="departs" className="relative border-t border-line/60">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-muted">
            <PlaneTakeoff className="h-3.5 w-3.5 text-accent" />
            Inspirations du moment
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Prochains départs.
          </h2>
          <p className="mt-3 text-base text-muted">
            Les destinations qui font swiper la communauté en ce moment.
          </p>
        </Reveal>

        <Reveal from="scale" className="mt-10">
          <div ref={tilt} className="transition-transform duration-300 ease-out">
            <div
              ref={boardRef}
              className="overflow-hidden rounded-3xl bg-ink p-2 shadow-2xl shadow-black/20 sm:p-3"
            >
              <div className="grid grid-cols-[4.5rem_1fr_auto] gap-x-3 px-3 pb-2 pt-1 font-mono text-[0.6rem] font-bold uppercase tracking-[0.2em] text-white/40 sm:grid-cols-[6rem_1fr_5rem_9rem] sm:px-4">
                <span>Vol</span>
                <span>Destination</span>
                <span className="hidden sm:block">Heure</span>
                <span className="text-right sm:text-left">Statut</span>
              </div>

              <ul className="space-y-1.5">
                {DEPARTURES.map((d, row) => (
                  <li
                    key={d.flight}
                    className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-x-3 rounded-xl bg-white/[0.04] px-3 py-3 font-mono text-sm font-bold tracking-wider text-white sm:grid-cols-[6rem_1fr_5rem_9rem] sm:px-4 sm:text-base"
                  >
                    <span className="text-white/60">
                      <FlapText text={d.flight} run={inView} delay={row * 140} />
                    </span>
                    <span className="min-w-0 truncate">
                      <FlapText text={d.city} run={inView} delay={row * 140 + 80} />
                      <span className="ml-2 hidden font-sans text-xs font-medium tracking-normal text-white/40 md:inline">
                        {d.country}
                      </span>
                    </span>
                    <span className="hidden text-amber-300 sm:block">
                      <FlapText text={d.time} run={inView} delay={row * 140 + 160} />
                    </span>
                    <span
                      className={`text-right text-[0.65rem] sm:text-left sm:text-xs ${
                        d.live ? 'animate-blink text-accent' : 'text-[#9fc3b2]'
                      }`}
                    >
                      <FlapText text={d.status} run={inView} delay={row * 140 + 240} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
