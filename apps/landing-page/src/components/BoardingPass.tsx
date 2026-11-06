import { useRef, type PointerEvent } from 'react';
import { Plane } from 'lucide-react';
import { useInView } from 'motion/react';
import { Reveal } from './Reveal';
import { WaitlistForm } from './WaitlistForm';

type BoardingPassProps = {
  joinedEmail: string | null;
  onJoined: (email: string) => void;
};

const PASS_FIELDS = [
  { label: 'Passager', value: 'Toi' },
  { label: 'Vol', value: 'SG 001' },
  { label: 'Porte', value: 'Mobile' },
  { label: 'Siège', value: '1A' },
];

/** Final call to action, styled as a boarding pass with a silver foil sheen on hover. */
export function BoardingPass({ joinedEmail, onJoined }: BoardingPassProps) {
  const passRef = useRef<HTMLDivElement>(null);
  const stamped = useInView(passRef, { once: true, margin: '0px 0px -25% 0px' });

  // The foil reflection follows the pointer (position only, the pass itself never moves).
  const moveFoil = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse' || !passRef.current) return;
    const rect = passRef.current.getBoundingClientRect();
    passRef.current.style.setProperty(
      '--foil-x',
      `${((e.clientX - rect.left) / rect.width) * 100}%`,
    );
    passRef.current.style.setProperty(
      '--foil-y',
      `${((e.clientY - rect.top) / rect.height) * 100}%`,
    );
  };

  return (
    <section id="embarquement" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
      <Reveal from="scale">
        <div
          ref={passRef}
          onPointerMove={moveFoil}
          className="boarding-pass group relative isolate overflow-hidden rounded-[2rem] bg-ink text-center shadow-xl selection:bg-cta/40 selection:text-ink"
        >
          {/* Silver foil, revealed on hover */}
          <div className="foil pointer-events-none absolute inset-0 z-10" aria-hidden="true" />

          {/* Pass header: airline, route, flight details */}
          <div className="relative px-6 pb-7 pt-7 text-left text-ink-inverse sm:px-10">
            <div className="flex items-center justify-between gap-4">
              <span className="tabular-nums text-xs font-bold uppercase tracking-[0.25em]">
                Carte d’embarquement
              </span>
              <span className="tabular-nums text-[0.6rem] font-bold uppercase tracking-[0.25em] text-ink-inverse/60">
                Seego Air
              </span>
            </div>

            {/* Route, the way it reads on a real pass: from code ✈ to code */}
            <div className="mt-6 flex items-center gap-3 sm:gap-6">
              <div>
                <p className="text-4xl font-extrabold leading-none tracking-tight sm:text-6xl">
                  PAR
                </p>
                <p className="mt-1 tabular-nums text-[0.6rem] font-bold uppercase tracking-[0.2em] text-ink-inverse/60">
                  Paris
                </p>
              </div>
              <div className="flex flex-1 items-center gap-2 text-cta" aria-hidden="true">
                <span className="h-px flex-1 border-t-2 border-dashed border-background/20" />
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cta text-ink">
                  <Plane className="h-4 w-4 rotate-45 fill-current" />
                </span>
                <span className="h-px flex-1 border-t-2 border-dashed border-background/20" />
              </div>
              <div className="text-right">
                <p className="text-4xl font-extrabold leading-none tracking-tight text-cta sm:text-6xl">
                  ???
                </p>
                <p className="mt-1 tabular-nums text-[0.6rem] font-bold uppercase tracking-[0.2em] text-ink-inverse/60">
                  Ton prochain swipe
                </p>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
              {PASS_FIELDS.map(({ label, value }) => (
                <div key={label}>
                  <dt className="tabular-nums text-[0.55rem] font-bold uppercase tracking-[0.2em] text-ink-inverse/60">
                    {label}
                  </dt>
                  <dd className="mt-0.5 tabular-nums text-sm font-bold text-ink-inverse">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Perforation with side notches */}
          <div className="relative h-0" aria-hidden="true">
            <span className="absolute -left-4 top-0 h-8 w-8 -translate-y-1/2 rounded-full bg-background" />
            <span className="absolute -right-4 top-0 h-8 w-8 -translate-y-1/2 rounded-full bg-background" />
            <span className="absolute inset-x-6 top-0 border-t-2 border-dashed border-background/15" />
          </div>

          <div className="relative px-6 pb-10 pt-10 sm:px-10 sm:pb-12">
            {/* Passport stamp */}
            <div
              className={`pointer-events-none absolute right-5 top-4 hidden rounded-xl border-2 border-cta/80 px-3 py-1.5 text-cta sm:right-10 sm:block ${
                stamped ? 'animate-stamp' : 'opacity-0'
              }`}
              aria-hidden="true"
            >
              <p className="tabular-nums text-[0.55rem] font-bold uppercase tracking-[0.2em]">
                Départ
              </p>
              <p className="text-sm font-black uppercase leading-none tracking-wider">Bientôt</p>
            </div>

            <h2 className="mx-auto max-w-2xl text-3xl font-display font-normal leading-tight tracking-tight text-ink-inverse sm:text-4xl">
              Le voyage spontané débarque sur mobile.
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-inverse/70">
              Laisse ton e-mail et reçois une notification dès l’ouverture des téléchargements.
            </p>

            <div className="relative z-20 mt-7">
              <WaitlistForm joinedEmail={joinedEmail} onJoined={onJoined} position="footer" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
