import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { CloudOff, Layers, Map } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { motion, useScroll, type MotionValue } from 'motion/react';
import { useScrub } from '../lib/useScrub';
import { PhoneMockup } from '../components/PhoneMockup';
import { PHOTOS, unsplash } from '../lib/photos';
import { Reveal } from '../components/Reveal';
import { Cross, LineReveal, SectionLabel } from './ui';

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  visual: (drift: MotionValue<string>) => ReactNode;
};

function Photo({ id, alt, drift }: { id: string; alt: string; drift: MotionValue<string> }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Slightly wider than its frame so it can drift against the rail (inner parallax) */}
      <motion.img
        src={unsplash(id, 900, 0.9)}
        alt={alt}
        loading="lazy"
        draggable={false}
        style={{ x: drift }}
        className="absolute inset-y-0 -left-[10%] h-full w-[120%] max-w-none object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  );
}

const FEATURES: Feature[] = [
  {
    icon: Layers,
    title: 'Swipe & découvre',
    description:
      'Oublie les 30 onglets ouverts. Swipe à droite les destinations et activités qui te font envie, à gauche le reste.',
    visual: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-accent-soft">
        <div className="w-[48%] max-w-[200px] translate-y-[28%]">
          <PhoneMockup />
        </div>
      </div>
    ),
  },
  {
    icon: Map,
    title: 'Itinéraire personalisé',
    description:
      'À partir de tes coups de cœur, Seego assemble un itinéraire jour par jour, optimisé et prêt à partir.',
    visual: (drift) => (
      <Photo id={PHOTOS.kyoto} alt="La pagode Yasaka à Kyoto au coucher du soleil" drift={drift} />
    ),
  },
  {
    icon: CloudOff,
    title: 'Dans ta poche',
    description:
      'Carte, planning et inspirations hors-ligne. Tout ton voyage t’accompagne, où que tu sois.',
    visual: (drift) => (
      <Photo id={PHOTOS.lisbon} alt="Deux tramways jaunes dans une rue de Lisbonne" drift={drift} />
    ),
  },
];

// Sideways rail from tablet up; on phones the cards simply stack.
const WIDE_QUERY = '(min-width: 768px)';
const subscribeWide = (cb: () => void) => {
  const mql = window.matchMedia(WIDE_QUERY);
  mql.addEventListener('change', cb);
  return () => mql.removeEventListener('change', cb);
};
const useWide = () =>
  useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => true,
  );

/** Pinned section: vertical scroll slides the cards sideways (stacked vertically on phones). */
export function FeatureRail() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const wide = useWide();

  // How far the track must travel so its last card ends at the right edge.
  useEffect(() => {
    const track = trackRef.current;
    if (!track || !wide) return;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener('resize', measure);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [wide]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
  const x = useScrub(scrollYProgress, [0, 1], [0, -distance]);
  const drift = useScrub(scrollYProgress, [0, 1], ['6%', '-6%']);

  const intro = (
    <>
      <SectionLabel index="02">L’app</SectionLabel>
      <h2 className="mt-6 text-[clamp(2.4rem,5vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
        <LineReveal lines={['Trois escales,', 'un voyage.']} />
      </h2>
      <p className="mt-5 max-w-sm text-base text-muted">
        Ce qui t’attend sur l’app, du premier swipe jusqu’à l’arrivée.
      </p>
    </>
  );

  const cards = FEATURES.map(({ icon: Icon, title, description, visual }, i) => (
    <article
      key={title}
      className={`relative flex shrink-0 flex-col overflow-hidden rounded-[2rem] bg-white shadow-sm ${
        wide ? 'h-[72svh] w-[56vw] lg:w-[40vw]' : 'w-full'
      }`}
    >
      <div className={`relative overflow-hidden ${wide ? 'flex-1' : 'h-72'}`}>{visual(drift)}</div>
      <div className="relative p-6 sm:p-8">
        <Cross className="right-6 top-6 text-muted/60" />
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-accent-soft text-accent">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.25em] text-muted">
            Escale {String(i + 1).padStart(2, '0')} / {String(FEATURES.length).padStart(2, '0')}
          </span>
        </div>
        <h3 className="mt-4 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          {title}
        </h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      </div>
    </article>
  ));

  if (!wide) {
    return (
      <section ref={sectionRef} id="escales" className="relative px-5 py-20">
        {intro}
        <div className="mt-10 space-y-5">
          {cards.map((card, i) => (
            <Reveal key={i} delay={i * 80}>
              {card}
            </Reveal>
          ))}
        </div>
      </section>
    );
  }

  return (
    // The section is as tall as the sideways travel, so one pixel scrolled = one pixel slid.
    <section
      ref={sectionRef}
      id="escales"
      data-pinned
      className="relative"
      style={{ height: `calc(100svh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex shrink-0 items-stretch gap-6 px-10"
        >
          <div className="flex w-[46vw] shrink-0 flex-col justify-end pb-6 lg:w-[34vw]">
            {intro}
          </div>
          {cards}
        </motion.div>
      </div>
    </section>
  );
}
