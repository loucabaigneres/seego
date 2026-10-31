import { LIKE_GOAL } from '../lib/feed'

interface LikeProgressProps {
  likes: number
  goalReached: boolean
  onShowResult: () => void
}

/** Like counter towards LIKE_GOAL and the "Ma destination" shortcut. */
export function LikeProgress({ likes, goalReached, onShowResult }: LikeProgressProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between text-xs">
          <span className="font-semibold text-[#1a1a1a]">
            {goalReached ? 'Assez de coups de cœur !' : 'Like ce qui te fait envie'}
          </span>
          <span className="font-medium tabular-nums text-[#888]">
            {Math.min(likes, LIKE_GOAL)}/{LIKE_GOAL}
          </span>
        </div>
        <div
          className="mt-1.5 flex gap-1"
          role="progressbar"
          aria-label="Coups de cœur"
          aria-valuemin={0}
          aria-valuemax={LIKE_GOAL}
          aria-valuenow={Math.min(likes, LIKE_GOAL)}
        >
          {Array.from({ length: LIKE_GOAL }, (_, i) => (
            <span
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i < likes ? 'bg-[#FF4D4D]' : 'bg-[#ddd]'
              }`}
            />
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onShowResult}
        disabled={likes === 0}
        className={`flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-xs font-bold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
          goalReached
            ? 'bg-[#FF4D4D] text-white shadow-lg shadow-red-500/25'
            : 'border border-[#ddd] bg-white text-[#1a1a1a] hover:border-[#FF4D4D]'
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinejoin="round" d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
        </svg>
        Ma destination
      </button>
    </div>
  )
}
