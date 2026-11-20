interface StartChoicesProps {
  onGuide: () => void;
  onSurprise: () => void;
  isSurpriseLoading: boolean;
}

/** The two ways to start a trip, set on top of the hero photo: a short quiz, or straight into the deck. */
export function StartChoices({ onGuide, onSurprise, isSurpriseLoading }: StartChoicesProps) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={onGuide}
        className="flex min-h-14 cursor-pointer flex-col items-start rounded-card bg-cta px-6 py-4 text-left text-ink transition hover:brightness-105 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-inverse"
      >
        <span className="text-base font-bold">Guide-moi</span>
        <span className="mt-0.5 text-xs text-ink/85">4 questions pour cibler tes envies</span>
      </button>

      <button
        type="button"
        onClick={onSurprise}
        disabled={isSurpriseLoading}
        className="flex cursor-pointer flex-col items-start min-h-14 rounded-card border border-ink-inverse/60 bg-ink/55 px-6 py-4 text-left text-ink-inverse backdrop-blur-md transition hover:bg-ink/65 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-inverse disabled:cursor-wait"
      >
        <span className="text-base font-bold">Surprends-moi</span>
        <span className="mt-0.5 text-xs text-ink-inverse">
          {isSurpriseLoading ? 'Préparation du deck…' : 'Swipe directement, sans filtre'}
        </span>
      </button>
    </div>
  );
}
