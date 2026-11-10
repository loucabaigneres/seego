import { useCallback, useEffect, useRef, useState } from 'react';
import { Plane } from 'lucide-react';
import { motion, useMotionValueEvent, useScroll, type MotionValue } from 'motion/react';
import { useScrub } from '../lib/useScrub';
import { SectionLabel } from './ui';

const TEXT =
  'Trente onglets ouverts, des heures de comparatifs, et toujours pas de billet. Seego transforme la recherche en jeu : tu swipes ce qui te fait vibrer, on trace la route.';

const WORDS = TEXT.split(' ');

// Ribbon designed on a 1440 × 1000 board, then redrawn in real pixels for the section size.
const DESIGN = { width: 1440, height: 1000 };
const RIBBON_PATH = 'M-80 180 C 260 60, 520 420, 760 300 S 1180 40, 1300 360 S 980 900, 1520 860';

/**
 * Scales every x,y pair of the design path to the section. Drawing in real pixels (instead of a
 * stretched viewBox) keeps the drawn length and the plane position in the same space on any screen.
 */
function scaledRibbon(width: number, height: number) {
  let i = 0;
  return RIBBON_PATH.replace(/-?\d+(\.\d+)?/g, (n) =>
    (Number(n) * (i++ % 2 === 0 ? width / DESIGN.width : height / DESIGN.height)).toFixed(1),
  );
}

function Word({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useScrub(progress, range, [0.15, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {word}&nbsp;
    </motion.span>
  );
}

/** Big statement whose words light up as you read down, over a ribbon drawn by the scroll. */
export function Manifesto() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.75', 'end 0.6'],
  });
  const ribbon = useScrub(scrollYProgress, [0, 0.9], [0, 1]);
  const pathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: DESIGN.width, height: DESIGN.height });

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    // offset* include the padding, like the absolutely positioned SVG that fills the section.
    const observer = new ResizeObserver(() =>
      setSize({ width: section.offsetWidth, height: section.offsetHeight }),
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Keep the plane on the tip of the drawn ribbon, nose along the curve.
  const placePlane = useCallback((progress: number) => {
    const path = pathRef.current;
    const plane = planeRef.current;
    if (!path || !plane) return;
    const length = path.getTotalLength();
    const at = length * progress;
    const tip = path.getPointAtLength(at);
    const ahead = path.getPointAtLength(Math.min(length, at + 4));
    const behind = path.getPointAtLength(Math.max(0, at - 4));
    const angle = Math.atan2(ahead.y - behind.y, ahead.x - behind.x);
    // The plane icon points up-right (-45°), hence the +45° to align it with the curve.
    plane.style.transform = `translate(${tip.x}px, ${tip.y}px) translate(-50%, -50%) rotate(${angle + Math.PI / 4}rad)`;
    plane.style.opacity = progress > 0.002 ? '1' : '0';
  }, []);

  useMotionValueEvent(ribbon, 'change', placePlane);
  // Re-place it once the path has been redrawn for a new size.
  useEffect(() => placePlane(ribbon.get()), [placePlane, ribbon, size]);

  return (
    <section ref={sectionRef} id="manifeste" className="relative overflow-hidden py-32 lg:py-48">
      {/* Flight ribbon, drawn as you scroll (Lusion's signature stroke, in pesca so the notte text stays readable on top of it) */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox={`0 0 ${size.width} ${size.height}`}
        fill="none"
        aria-hidden="true"
      >
        <motion.path
          ref={pathRef}
          d={scaledRibbon(size.width, size.height)}
          stroke="var(--color-accent)"
          strokeWidth={Math.min(56, size.width * 0.1)}
          strokeLinecap="round"
          style={{ pathLength: ribbon }}
          opacity={1}
        />
      </svg>

      {/* The plane drawing the ribbon behind it */}
      <div
        ref={planeRef}
        className="pointer-events-none absolute left-0 top-0 z-20 opacity-0 transition-opacity duration-300"
        aria-hidden="true"
      >
        <Plane className="h-14 w-14 fill-brand text-brand drop-shadow-lg" strokeWidth={1.2} />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
        <SectionLabel index="01">Manifeste</SectionLabel>
        <p className="mt-8 text-[clamp(1.9rem,4.6vw,4rem)] font-extrabold leading-[1.08] tracking-tight text-ink">
          {WORDS.map((word, i) => (
            <Word
              key={`${word}-${i}`}
              word={word}
              progress={scrollYProgress}
              range={[i / WORDS.length, (i + 1) / WORDS.length]}
            />
          ))}
        </p>
      </div>
    </section>
  );
}
