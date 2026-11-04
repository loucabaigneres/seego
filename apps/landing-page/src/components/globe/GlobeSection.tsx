import { lazy, Suspense, useRef, useState } from 'react';
import { Hand, MapPin } from 'lucide-react';
import { useInView } from 'motion/react';
import { Reveal } from '../Reveal';
import { DESTINATIONS, ORIGIN } from './destinations';

// three.js only loads when the section gets close to the viewport.
const GlobeCanvas = lazy(() => import('./GlobeCanvas'));

function GlobePlaceholder() {
  return (
    <div className="absolute inset-[12%] rounded-full bg-white shadow-[0_0_80px_-10px] shadow-accent/30" />
  );
}

export function GlobeSection() {
  const stageRef = useRef<HTMLDivElement>(null);
  const near = useInView(stageRef, { once: true, margin: '400px 0px' });
  const [failed, setFailed] = useState(false);

  return (
    <section id="globe" className="relative border-t border-line/60">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
        <Reveal from="left" className="text-center lg:text-left">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Le monde entier,
            <br />à portée de swipe.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base text-muted lg:mx-0">
            Chaque coup de cœur trace une nouvelle route depuis chez toi. Fais tourner le globe et
            choisis ta prochaine escale.
          </p>

          <ul className="mt-6 flex flex-wrap justify-center gap-2 lg:justify-start">
            {DESTINATIONS.map((d) => (
              <li
                key={d.name}
                className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-ink"
              >
                <MapPin className="h-3 w-3 text-accent" aria-hidden="true" />
                {ORIGIN.name} → {d.name}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal from="scale">
          <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[560px]">
            {near && !failed ? (
              <Suspense fallback={<GlobePlaceholder />}>
                <GlobeCanvas onError={() => setFailed(true)} />
              </Suspense>
            ) : (
              <GlobePlaceholder />
            )}
            {!failed && (
              <p className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-white/80 px-3 py-1 text-[0.7rem] font-semibold text-muted shadow-sm backdrop-blur-sm">
                <Hand className="h-3.5 w-3.5" aria-hidden="true" />
                Glisse pour faire tourner
              </p>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
