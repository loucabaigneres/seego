import { useState, type CSSProperties, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Layers, Map, Plane, Smartphone } from 'lucide-react';
import { useScrollProgress, useTilt } from '../lib/motion';
import { Reveal } from './Reveal';

type Feature = {
  icon: LucideIcon;
  stop: string;
  title: string;
  description: string;
};

const FEATURES: Feature[] = [
  {
    icon: Layers,
    stop: 'Départ',
    title: 'Swipe & découvre',
    description:
      'Oublie les 30 onglets ouverts. Swipe à droite les destinations et activités qui te font envie, à gauche le reste.',
  },
  {
    icon: Map,
    stop: 'Escale',
    title: 'Itinéraire auto-magique',
    description:
      'À partir de tes coups de cœur, Seego assemble un itinéraire jour par jour, optimisé et prêt à partir.',
  },
  {
    icon: Smartphone,
    stop: 'Arrivée',
    title: 'Dans ta poche',
    description:
      'Carte, planning et inspirations hors-ligne. Tout ton voyage t’accompagne, où que tu sois.',
  },
];

function TiltCard({ active, children }: { active: boolean; children: ReactNode }) {
  const tilt = useTilt<HTMLDivElement>(6);
  return (
    <div
      ref={tilt}
      className={`group rounded-3xl border bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-lg sm:p-7 ${
        active ? 'border-accent/40 shadow-md' : 'border-line'
      }`}
    >
      {children}
    </div>
  );
}

export function Features() {
  const [reached, setReached] = useState(0);

  // Scroll drives the route: the line fills, the plane follows and each stop lights up as it passes.
  const routeRef = useScrollProgress<HTMLDivElement>((progress, el) => {
    el.style.setProperty('--route', progress.toFixed(4));
    const planeY = el.getBoundingClientRect().top + progress * el.offsetHeight;
    let count = 0;
    el.querySelectorAll('[data-stop]').forEach((stop) => {
      if (stop.getBoundingClientRect().top + 16 <= planeY) count++;
    });
    setReached(count);
  }, 0.55);

  return (
    <section id="itineraire" className="relative border-t border-line/60 bg-sand">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-6 lg:py-24">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Voyager, version ludique.
          </h2>
          <p className="mt-3 text-base text-muted">
            Trois escales, et ton séjour prend forme. Voilà ce qui t’attend sur l’app.
          </p>
        </Reveal>

        <div ref={routeRef} className="relative mt-14" style={{ '--route': 0 } as CSSProperties}>
          {/* Dashed route */}
          <div
            className="absolute bottom-0 left-6 top-0 w-0.5 -translate-x-1/2 bg-[repeating-linear-gradient(180deg,var(--color-line)_0_8px,transparent_8px_16px)] lg:left-1/2"
            aria-hidden="true"
          />
          {/* Travelled route */}
          <div
            className="absolute bottom-0 left-6 top-0 w-0.5 origin-top -translate-x-1/2 bg-accent lg:left-1/2"
            style={{ transform: 'scaleY(var(--route))' }}
            aria-hidden="true"
          />
          {/* Plane */}
          <div
            className="absolute left-6 z-10 -translate-x-1/2 -translate-y-1/2 lg:left-1/2"
            style={{ top: 'calc(var(--route) * 100%)' }}
            aria-hidden="true"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white shadow-lg shadow-black/20 ring-4 ring-sand">
              <Plane className="h-4 w-4 rotate-135 fill-current" />
            </span>
          </div>

          <ol className="space-y-12 lg:space-y-20">
            {FEATURES.map(({ icon: Icon, stop, title, description }, index) => {
              const active = index < reached;
              const right = index % 2 === 1;
              return (
                <li key={title} className="relative pl-16 lg:grid lg:grid-cols-2 lg:gap-24 lg:pl-0">
                  {/* Stop marker */}
                  <span
                    data-stop
                    className={`absolute left-6 top-6 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 transition-all duration-500 lg:left-1/2 ${
                      active
                        ? 'scale-125 border-accent bg-accent shadow-[0_0_0_6px] shadow-accent/15'
                        : 'border-line bg-white'
                    }`}
                    aria-hidden="true"
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${active ? 'bg-white' : 'bg-line'}`}
                    />
                  </span>

                  <Reveal
                    as="article"
                    from={right ? 'right' : 'left'}
                    className={right ? 'lg:col-start-2' : 'lg:text-right'}
                  >
                    <TiltCard active={active}>
                      <div
                        className={`flex items-center gap-3 ${right ? '' : 'lg:flex-row-reverse'}`}
                      >
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-500 group-hover:scale-110 ${
                            active ? 'bg-accent text-white' : 'bg-accent-soft text-accent'
                          }`}
                        >
                          <Icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <span className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-muted">
                          Étape {String(index + 1).padStart(2, '0')} · {stop}
                        </span>
                      </div>
                      <h3 className="mt-5 text-lg font-bold text-ink">{title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
                    </TiltCard>
                  </Reveal>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
