import { Plane } from 'lucide-react';
import { useInView, useTilt } from '../lib/motion';
import { Reveal } from './Reveal';
import { WaitlistForm } from './WaitlistForm';

type CtaBandProps = {
  joinedEmail: string | null;
  onJoined: (email: string) => void;
};

const PASS_FIELDS = [
  { label: 'Passager', value: 'Toi' },
  { label: 'Vol', value: 'SG 001' },
  { label: 'Porte', value: 'Mobile' },
  { label: 'Siège', value: '1A' },
];

export function CtaBand({ joinedEmail, onJoined }: CtaBandProps) {
  const [stampRef, stamped] = useInView<HTMLDivElement>({ rootMargin: '0px 0px -25% 0px' });
  const tilt = useTilt<HTMLDivElement>(4);

  return (
    <section id="embarquement" className="mx-auto max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
      <Reveal from="scale">
        <div ref={tilt} className="transition-transform duration-300 ease-out">
          {/* Boarding pass */}
          <div
            ref={stampRef}
            className="relative overflow-hidden rounded-[2rem] bg-ink text-center shadow-xl"
          >
            {/* glow */}
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-accent/30 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
              aria-hidden="true"
            />

            {/* Pass header */}
            <div className="relative flex flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 pb-6 pt-7 text-left sm:px-10">
              <div className="flex items-center gap-2 text-white">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
                  <Plane className="h-4 w-4 rotate-45 fill-current" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs font-bold uppercase tracking-[0.25em]">
                  Carte d’embarquement
                </span>
              </div>
              <dl className="flex flex-wrap gap-x-6 gap-y-2">
                {PASS_FIELDS.map(({ label, value }) => (
                  <div key={label}>
                    <dt className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.2em] text-white/40">
                      {label}
                    </dt>
                    <dd className="font-mono text-xs font-bold text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Perforation with side notches */}
            <div className="relative h-0" aria-hidden="true">
              <span className="absolute -left-4 top-0 h-8 w-8 -translate-y-1/2 rounded-full bg-cream" />
              <span className="absolute -right-4 top-0 h-8 w-8 -translate-y-1/2 rounded-full bg-cream" />
              <span className="absolute inset-x-6 top-0 border-t-2 border-dashed border-white/15" />
            </div>

            <div className="relative px-6 pb-12 pt-10 sm:px-10 sm:pb-16">
              {/* Passport stamp */}
              <div
                className={`pointer-events-none absolute right-5 top-4 hidden rounded-xl border-2 border-accent/80 px-3 py-1.5 text-accent sm:right-10 sm:block ${
                  stamped ? 'animate-stamp' : 'opacity-0'
                }`}
                aria-hidden="true"
              >
                <p className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.2em]">
                  Départ
                </p>
                <p className="text-sm font-black uppercase leading-none tracking-wider">Bientôt</p>
              </div>

              <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
                Le voyage spontané débarque sur mobile.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm text-white/70">
                Laisse ton e-mail et reçois une notification dès l’ouverture des téléchargements.
              </p>

              <div className="mt-7">
                <WaitlistForm
                  joinedEmail={joinedEmail}
                  onJoined={onJoined}
                  position="footer"
                  tone="dark"
                />
              </div>

              {/* Barcode */}
              <div
                className="mx-auto mt-10 h-8 max-w-xs bg-[repeating-linear-gradient(90deg,rgb(255_255_255/0.25)_0_2px,transparent_2px_4px,rgb(255_255_255/0.25)_4px_5px,transparent_5px_9px)]"
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
