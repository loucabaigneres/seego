import { colors } from '@seego/ui'

import { confidenceLabel } from '../lib/recommendation'

interface MatchSummaryProps {
  confidence: number
  likes: number
  seen: number
}

/** Confidence ring of the recommendation, with the swipes it is based on. */
export function MatchSummary({ confidence, likes, seen }: MatchSummaryProps) {
  const pct = Math.round(confidence * 100)
  const radius = 26
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex items-center gap-4 rounded-card border border-brand/15 bg-surface p-4">
      <div className="relative h-16 w-16 shrink-0" role="img" aria-label={`Fiabilité ${pct} %`}>
        <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
          <circle cx="32" cy="32" r={radius} fill="none" stroke={colors.surface} strokeWidth="6" />
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={colors.cta}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (pct / 100) * circumference}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-ink">
          {pct}%
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-bold text-ink">{confidenceLabel(pct)}</p>
        <p className="mt-0.5 text-sm leading-snug text-ink-muted">
          Basé sur tes {likes} coups de cœur parmi {seen} lieux découverts.
          {pct < 90 && ' Continue à swiper pour affiner.'}
        </p>
      </div>
    </div>
  )
}
