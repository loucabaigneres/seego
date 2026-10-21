interface QuizFooterProps {
  canGoBack: boolean;
  canContinue: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onForward: () => void;
}

export function QuizFooter({ canGoBack, canContinue, isLastStep, onBack, onForward }: QuizFooterProps) {
  return (
    <div className="mt-8 flex items-center justify-between border-t border-[#eee] pt-4">
      {canGoBack ? (
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-[#888] hover:text-[#1a1a1a] transition px-3 py-2 cursor-pointer"
        >
          Retour
        </button>
      ) : (
        <div />
      )}

      <button
        type="button"
        disabled={!canContinue}
        onClick={onForward}
        className="rounded-2xl bg-[#FF4D4D] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-500/25 hover:brightness-105 active:scale-95 disabled:opacity-40 transition cursor-pointer"
      >
        {isLastStep ? 'Découvrir mes destinations' : 'Continuer'}
      </button>
    </div>
  );
}
