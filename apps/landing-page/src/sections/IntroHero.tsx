import { useEffect, useState } from 'react';
import { ArrowDown, Heart } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { WaitlistForm } from '../components/WaitlistForm';
import { PHOTOS, unsplash } from '../lib/photos';
import { Cross, LineReveal } from './ui';

const EASE_OUT = [0.16, 1, 0.3, 1] as const;

const CARDS = [
  {
    id: PHOTOS.lisbon,
    country: 'Portugal',
    city: 'Lisbonne',
    alt: 'Deux tramways jaunes dans une rue de Lisbonne',
  },
  { id: PHOTOS.rome, country: 'Italie', city: 'Rome', alt: 'Le Colisée de Rome au crépuscule' },
  { id: PHOTOS.santorini, country: 'Grèce', city: 'Santorin', alt: 'Oia, Santorin, au crépuscule' },
];

// Fan slots, from the back of the pile to the top card.
const SLOTS = [
  { x: '16%', rotate: 9, scale: 0.94 },
  { x: '-14%', rotate: -8, scale: 0.97 },
  { x: '0%', rotate: 2, scale: 1 },
];
// Where a liked card flies to before going back under the pile.
const SWIPED = { x: '135%', rotate: 24, scale: 1, opacity: 0 };
const SWIPE_EVERY = 3200; // ms between two swipes
const SWIPE_MS = 550;

/** Destination cards that swipe themselves "right" one after the other, like in the app. */
function SwipeDeck() {
  const reduced = useReducedMotion();
  // order[i] = card shown in slot i (last = top card).
  const [order, setOrder] = useState([2, 1, 0]);
  const [swiping, setSwiping] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduced || paused) return;
    let settle = 0;
    const timer = window.setInterval(() => {
      setSwiping(true);
      // Once it has flown off, the liked card goes back under the pile.
      settle = window.setTimeout(() => {
        setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
        setSwiping(false);
      }, SWIPE_MS);
    }, SWIPE_EVERY);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(settle);
    };
  }, [reduced, paused]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, ease: EASE_OUT, delay: 0.3 }}
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      className="relative mx-auto aspect-[3/4] w-full max-w-[17rem] sm:max-w-xs"
      aria-hidden="true"
    >
      {CARDS.map((card, index) => {
        const slot = order.indexOf(index);
        const isTop = slot === SLOTS.length - 1;
        return (
          <motion.div
            key={card.id}
            initial={false}
            animate={isTop && swiping ? SWIPED : { ...SLOTS[slot], opacity: 1 }}
            transition={{ duration: SWIPE_MS / 1000, ease: EASE_OUT }}
            style={{ zIndex: slot }}
            className="absolute inset-0 overflow-hidden rounded-[2rem] bg-line shadow-xl shadow-ink/15"
          >
            <img
              src={unsplash(card.id, 520, 1.33)}
              alt={card.alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              draggable={false}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 text-white">
              <div>
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.25em] text-white/70">
                  {card.country}
                </p>
                <p className="mt-1 text-2xl font-display">{card.city}</p>
              </div>
              {/* The heart beats just as the card gets liked */}
              <motion.span
                animate={isTop && swiping ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                transition={{ duration: 0.35 }}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-cta text-ink shadow-lg"
              >
                <Heart className="h-5 w-5 fill-current" />
              </motion.span>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

type IntroHeroProps = {
  joinedEmail: string | null;
  onJoined: (email: string) => void;
};

/** Opening screen: the promise, the waitlist form and a swipe deck of destinations. */
export function IntroHero({ joinedEmail, onJoined }: IntroHeroProps) {
  return (
    <section
      id="top"
      className="relative flex min-h-svh flex-col justify-center px-6 pb-20 pt-28 sm:px-10 lg:pb-16"
    >
      <Cross className="left-5 top-24 text-ink-muted" />
      <Cross className="right-5 top-24 text-ink-muted" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="tabular-nums text-[0.65rem] font-bold uppercase tracking-[0.25em] text-brand">
            L’application mobile arrive bientôt
          </p>
          <h1 className="mt-4 text-[clamp(2.75rem,6.5vw,6.5rem)] font-display font-normal leading-[0.95] tracking-tight text-ink">
            <LineReveal trigger="mount" delay={0.2} lines={['Ton prochain', 'voyage, en un']} />
            <LineReveal trigger="mount" delay={0.38} lines={['swipe.']} className="text-brand" />
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE_OUT, delay: 0.6 }}
            className="mt-8 *:mx-0"
          >
            <WaitlistForm
              joinedEmail={joinedEmail}
              onJoined={onJoined}
              position="hero"
              align="start"
            />
          </motion.div>
        </div>

        <SwipeDeck />
      </div>

      <a
        href="#manifeste"
        className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-1.5 tabular-nums text-[0.6rem] font-bold uppercase tracking-[0.25em] text-ink/70 transition hover:text-ink"
      >
        Scroll pour décoller
        <ArrowDown className="h-3 w-3 animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
