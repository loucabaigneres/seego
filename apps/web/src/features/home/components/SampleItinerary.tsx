import { useEffect, useRef, useState } from 'react';
import { unsplash } from '../lib/photos';
import { SAMPLE_TRIP } from '../lib/sampleTrip';

const STEP_MS = 160;

/**
 * Shows what Seego builds: a ticket-shaped itinerary that writes itself once it scrolls into view
 * (and again when another day is picked). Self-contained, removing it only means deleting its line on the home page.
 */
export function SampleItinerary({ onStart }: { onStart: () => void }) {
  const [day, setDay] = useState(0);
  const [visible, setVisible] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ticketRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const current = SAMPLE_TRIP.days[day];

  return (
    <section aria-labelledby="sample-title" className="px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div>
          <h2
            id="sample-title"
            className="max-w-md font-display text-3xl font-normal leading-tight text-ink sm:text-4xl lg:text-5xl"
          >
            Tes swipes deviennent un programme.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-secondary sm:text-lg">
            Jour par jour, avec les horaires, les repas et les trajets entre chaque étape. Tu gardes ce qui te plaît
            et tu remplaces le reste.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-8 min-h-12 cursor-pointer rounded-card bg-brand px-6 py-3 text-base font-bold text-accent transition hover:brightness-110 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            Créer mon voyage
          </button>
        </div>

        <div ref={ticketRef} className="mx-auto w-full max-w-md">
          <p className="mb-3 text-sm text-ink-muted">Exemple d'itinéraire généré</p>

          <div className="overflow-hidden rounded-card border border-brand/15 bg-surface">
            <div className="relative h-36">
              <img
                src={unsplash(SAMPLE_TRIP.photo, 800, 0.4)}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/75 to-ink/40" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-ink-inverse">
                <p className="font-display text-3xl font-normal leading-none">{SAMPLE_TRIP.city}</p>
                <p className="mt-1 text-sm">
                  {SAMPLE_TRIP.days.length} jours pour {SAMPLE_TRIP.travelers} voyageurs
                </p>
              </div>
            </div>

            {/* Perforation, like a boarding pass */}
            <div aria-hidden className="relative border-t border-dashed border-brand/30">
              <span className="absolute -left-3 -top-3 h-6 w-6 rounded-full bg-background" />
              <span className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-background" />
            </div>

            <div role="tablist" aria-label="Jours du voyage" className="flex gap-2 px-5 pt-6">
              {SAMPLE_TRIP.days.map((d, i) => (
                <button
                  key={d.label}
                  type="button"
                  role="tab"
                  id={`sample-tab-${i}`}
                  aria-selected={i === day}
                  aria-controls="sample-panel"
                  onClick={() => setDay(i)}
                  className={`min-h-11 cursor-pointer rounded-full px-4 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
                    i === day ? 'bg-brand text-accent' : 'text-ink hover:bg-background'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div id="sample-panel" role="tabpanel" aria-labelledby={`sample-tab-${day}`} className="px-5 pb-6 pt-4">
              <p className="font-display text-xl text-ink">{current.theme}</p>

              <ol key={`${day}-${visible}`} className="relative mt-5">
                {/* The route line draws itself before the stops appear */}
                <span
                  aria-hidden
                  className="absolute bottom-3 left-[3.9rem] top-3 w-px origin-top bg-brand/25 motion-safe:animate-[sample-line_0.9s_ease-out_both]"
                />
                {current.stops.map((stop, i) => (
                  <li
                    key={stop.time}
                    className={`relative flex gap-4 pb-5 last:pb-0 ${
                      visible ? 'motion-safe:animate-[sample-stop_0.5s_ease-out_both]' : 'opacity-0 motion-reduce:opacity-100'
                    }`}
                    style={{ animationDelay: `${i * STEP_MS + 250}ms` }}
                  >
                    <span className="w-10 shrink-0 pt-0.5 text-sm font-semibold tabular-nums text-ink">{stop.time}</span>
                    <span aria-hidden className="relative z-10 mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-brand bg-surface" />
                    <div>
                      <p className="text-base font-semibold leading-tight text-ink">{stop.title}</p>
                      <p className="mt-0.5 text-sm text-ink-secondary">{stop.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
