import { ArrowUpRight, Clock, QrCode } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { LineReveal, SectionLabel } from './ui';

const FORM_URL = 'https://tally.so/r/RWxa5d';

/** User research questionnaire: a button to the Tally form, plus a luggage-tag QR code. */
export function SurveySection() {
  return (
    <section id="avis" className="relative border-t border-line/60">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
        {/* Pitch + button */}
        <div>
          <SectionLabel index="03">Ton avis</SectionLabel>
          <h2 className="mt-6 text-[clamp(2.4rem,5vw,4.5rem)] font-extrabold leading-[0.95] tracking-tight text-ink">
            <LineReveal lines={['Aide-nous à', 'tracer la route.']} />
          </h2>
          <p className="mt-5 max-w-md text-base text-muted">
            Quelques questions sur ta façon de préparer tes voyages. Tes réponses décident de ce
            qu’on construit en premier dans l’app.
          </p>

          <Reveal className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href={FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-accent/30 transition hover:brightness-110 active:scale-95"
            >
              Répondre au questionnaire
              <ArrowUpRight
                className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3 py-1.5 text-xs font-bold text-accent">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />3 minutes, anonyme
            </span>
          </Reveal>
        </div>

        {/* Luggage tag with the QR code (smaller on phones) */}
        <Reveal from="right" className="flex justify-center">
          <div className="relative flex -rotate-3 items-center gap-3 rounded-2xl rounded-l-[2.5rem] bg-ink py-5 pl-11 pr-4 text-white shadow-xl shadow-black/15 sm:gap-6 sm:rounded-l-[3rem] sm:py-6 sm:pl-14 sm:pr-8">
            {/* Eyelet and string */}
            <span
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-cream ring-4 ring-white/20 sm:left-5 sm:h-5 sm:w-5"
              aria-hidden="true"
            />
            <span
              className="absolute -left-20 top-1/2 hidden h-px w-24 -rotate-12 bg-muted/60 sm:block"
              aria-hidden="true"
            />
            <div className="shrink-0 rounded-xl bg-white p-2 sm:p-3">
              <img
                src="/qr-questionnaire.svg"
                alt="QR code vers le questionnaire Seego"
                width={144}
                height={144}
                className="h-24 w-24 sm:h-36 sm:w-36"
              />
            </div>
            <div className="max-w-[8.5rem] sm:max-w-[11rem]">
              <p className="flex items-center gap-1.5 font-mono text-[0.6rem] font-bold uppercase tracking-[0.25em] text-white/50">
                <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                Bagage cabine
              </p>
              {/* On a phone you are already there: the QR is for sharing it around */}
              <p className="mt-2 text-sm font-bold leading-snug lg:hidden">
                Fais-le scanner à tes potes de voyage.
              </p>
              <p className="mt-2 hidden text-sm font-bold leading-snug lg:block">
                Plus à l’aise sur ton téléphone ? Scanne et réponds dans le métro.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
