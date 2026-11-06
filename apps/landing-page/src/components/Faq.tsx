import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Reveal } from './Reveal';

type QA = { question: string; answer: string };

const FAQS: QA[] = [
  {
    question: 'Quand sort l’application ?',
    answer:
      'On vise un lancement très bientôt sur iOS et Android. Inscris-toi avec ton e-mail pour être prévenu en premier le jour du lancement.',
  },
  {
    question: 'Combien coûte Seego ?',
    answer:
      'L’application sera gratuite au lancement : tu pourras découvrir des destinations et composer ton itinéraire sans rien payer.',
  },
  {
    question: 'Comment fonctionne le swipe ?',
    answer:
      'Tu swipes à droite les lieux et activités qui te plaisent, à gauche le reste. À partir de tes coups de cœur, Seego assemble automatiquement un itinéraire jour par jour.',
  },
  {
    question: 'Sur quelles plateformes sera-t-elle disponible ?',
    answer: 'Seego arrive sur iOS et Android dès le lancement.',
  },
  {
    question: 'Que faites-vous de mon e-mail ?',
    answer:
      'On l’utilise uniquement pour te prévenir du lancement et te tenir au courant des nouveautés. Pas de spam, et tu peux te désinscrire à tout moment.',
  },
];

/** FAQ with frosted cards, made to scroll over the sky photo of the take-off section. */
export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq">
      <div className="mx-auto max-w-3xl px-5 py-20 sm:px-6 lg:py-24">
        <Reveal className="mx-auto w-fit rounded-3xl bg-background/70 px-8 py-6 text-center shadow-lg shadow-ink/10 backdrop-blur-md">
          <h2 className="text-3xl font-display font-normal tracking-tight text-ink sm:text-4xl">
            Questions fréquentes
          </h2>
          <p className="mt-3 text-base text-ink-muted">Tout ce qu’il faut savoir avant le lancement.</p>
        </Reveal>

        <div className="mt-10 space-y-3">
          {FAQS.map((item, index) => {
            const open = openIndex === index;
            return (
              <Reveal
                key={item.question}
                delay={index * 70}
                className={`overflow-hidden rounded-2xl border bg-background/80 shadow-lg shadow-ink/10 backdrop-blur-md ${
                  open ? 'border-cta/30' : 'border-background/60'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  aria-expanded={open}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-bold text-ink sm:text-base">{item.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-brand transition-transform duration-300 ${
                      open ? 'rotate-180' : ''
                    }`}
                    aria-hidden="true"
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-out ${
                    open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-ink-muted">{item.answer}</p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
