import { ArrowUpRight, Heart, Info, Sparkles, Target, X } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { track } from '../lib/analytics';
import { PHOTOS, unsplash } from '../lib/photos';
import { LineReveal, SectionLabel } from './ui';

const WEBAPP_URL = 'https://app.seego.fr';

// The two ways in, as offered on the web app's home screen.
const MODES = [
  {
    icon: Target,
    title: 'Guide-moi',
    text: '4 questions express (ambiance, météo, compagnie) pour cibler les meilleures propositions.',
  },
  {
    icon: Sparkles,
    title: 'Surprends-moi',
    text: 'Envie d’explorer sans filtre ? Swipe directement les lieux de nos destinations phares.',
  },
];

/** A browser window showing the web app's swipe screen (drawn in HTML, not a screenshot). */
function BrowserMockup() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-2xl shadow-ink/15 ring-1 ring-line">
      {/* Window bar */}
      <div className="flex items-center gap-3 border-b border-line bg-background px-4 py-3">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
          <span className="h-2.5 w-2.5 rounded-full bg-line" />
        </div>
        <span className="mx-auto rounded-full bg-white px-4 py-1 text-[0.7rem] font-semibold text-ink-muted ring-1 ring-line">
          app.seego.fr
        </span>
        <span className="w-10" aria-hidden="true" />
      </div>

      {/* Swipe screen */}
      <div className="bg-background px-5 pb-5 pt-4 sm:px-8">
        <div className="mx-auto max-w-xs">
          <div className="flex items-center justify-between text-[0.7rem] font-bold text-ink">
            <span>Like ce qui te fait envie</span>
            <span className="tabular-nums text-ink-muted">3/10</span>
          </div>
          <div className="mt-2 flex gap-1" aria-hidden="true">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={`h-1 flex-1 rounded-full ${i < 3 ? 'bg-cta' : 'bg-line'}`} />
            ))}
          </div>

          <div className="relative mt-4 aspect-[4/5] overflow-hidden rounded-3xl bg-line shadow-lg shadow-ink/10">
            <img
              src={unsplash(PHOTOS.rome, 600, 1.25)}
              alt="Le Colisée de Rome au crépuscule, carte à swiper dans la webapp"
              loading="lazy"
              draggable={false}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <p className="text-[0.6rem] font-bold uppercase tracking-[0.25em] text-white/70">
                Rome · Italie
              </p>
              <p className="mt-1 text-2xl font-display">Le Colisée</p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4" aria-hidden="true">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-ink-muted shadow-sm ring-1 ring-line">
              <X className="h-5 w-5" />
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-muted shadow-sm ring-1 ring-line">
              <Info className="h-4 w-4" />
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-cta text-ink shadow-md shadow-cta/30">
              <Heart className="h-5 w-5 fill-current" />
            </span>
          </div>
          <p className="mt-3 text-center text-[0.65rem] text-ink-muted">
            ← Passer · → J’adore · Espace : ma destination
          </p>
        </div>
      </div>
    </div>
  );
}

/** Points to the web app, already live, while the mobile app is on its way. */
export function WebAppSection() {
  return (
    <section id="webapp" className="relative border-t border-line/60">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-6 lg:grid-cols-[1fr_1fr] lg:gap-16 lg:py-28">
        <div>
          <SectionLabel index="03">La webapp</SectionLabel>
          <h2 className="mt-6 text-[clamp(2.4rem,5vw,4.5rem)] font-display font-normal leading-[0.95] tracking-tight text-ink">
            <LineReveal lines={['Pas envie d’attendre ?', 'Swipe dès maintenant.']} />
          </h2>
          <p className="mt-5 max-w-md text-base text-ink-muted">
            L’app mobile arrive bientôt, mais Seego tourne déjà sur le web. Trouve ta prochaine
            escapade depuis ton navigateur, sans rien installer.
          </p>

          <ul className="mt-8 space-y-3">
            {MODES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4 rounded-2xl bg-white p-4 ring-1 ring-line">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cta/15 text-ink">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-bold text-ink">{title}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">{text}</p>
                </div>
              </li>
            ))}
          </ul>

          <a
            href={WEBAPP_URL}
            onClick={() => track('webapp_cta_clicked')}
            target="_blank"
            rel="noreferrer"
            className="group mt-8 inline-flex items-center gap-2 rounded-full bg-cta px-6 py-3.5 text-sm font-bold text-ink shadow-lg shadow-cta/30 transition hover:brightness-110 active:scale-95"
          >
            Ouvrir la webapp
            <ArrowUpRight
              className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </a>
        </div>

        <Reveal from="scale">
          <BrowserMockup />
        </Reveal>
      </div>
    </section>
  );
}
