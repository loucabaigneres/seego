import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { HOME_DESTINATIONS, unsplash } from '../lib/photos';

/** The photo changes twice, then stays: automatic motion stops within 5 s, so no pause control is required (WCAG 2.2.2). */
const SLIDE_MS = 2500;

/**
 * Dark scrim under the text. Text stays at 4.5:1 (WCAG AA) even over a pure-white photo pixel
 * only while the scrim is at least 70 % opaque behind it, hence the 72 % stop up to 80 % of the height.
 */
const SCRIM =
  'bg-[linear-gradient(to_top,rgb(34_9_15/0.92)_0%,rgb(34_9_15/0.72)_80%,rgb(34_9_15/0.15)_100%)]';

/**
 * Full-bleed destination photo with the headline on it. The photo changes slowly, nothing else
 * moves, and only for 5 s. Edge to edge on phones.
 */
export function HomeHero({ actions }: { actions: ReactNode }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timers = HOME_DESTINATIONS.slice(1).map((_, i) =>
      window.setTimeout(() => setIndex(i + 1), (i + 1) * SLIDE_MS),
    );
    return () => timers.forEach(window.clearTimeout);
  }, []);

  const current = HOME_DESTINATIONS[index];

  return (
    <section aria-label="Présentation de Seego" className="sm:px-5 sm:pt-5">
      <div className="relative mx-auto flex min-h-[calc(100svh-4.0625rem)] max-w-7xl flex-col justify-end overflow-hidden bg-ink sm:min-h-[36rem] sm:rounded-sheet lg:min-h-[40rem]">
        {HOME_DESTINATIONS.map((destination, i) => (
          <img
            key={destination.city}
            src={unsplash(destination.photo, 1600, 0.7)}
            srcSet={`${unsplash(destination.photo, 900, 1.8)} 900w, ${unsplash(destination.photo, 1600, 0.7)} 1600w`}
            sizes="100vw"
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 motion-reduce:transition-none ${
              i === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
        <div className={`absolute inset-0 ${SCRIM}`} />

        <div className="relative p-6 sm:p-10 lg:p-14">
          <h1 className="max-w-3xl font-display text-5xl font-normal leading-[1.02] tracking-tight text-ink-inverse sm:text-6xl lg:text-7xl">
            Ton prochain voyage, trouvé en un swipe.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-ink-inverse sm:text-lg">
            Swipe les lieux qui t'inspirent. Seego assemble l'itinéraire, les hébergements et les trajets.
          </p>
          {actions}
          <p className="mt-8 text-sm text-ink-inverse lg:text-right">
            <span className="sr-only">Photo affichée : </span>
            {current.city}, {current.country}
          </p>
        </div>
      </div>
    </section>
  );
}
