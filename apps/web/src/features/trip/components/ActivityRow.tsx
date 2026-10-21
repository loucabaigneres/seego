import type React from 'react'
import { PinIcon } from './PinIcon'
import { categoryMeta, cleanDesc } from '../lib/tripUtils'
import type { Activity } from '../types'

export function ActivityRow({
  activity,
  index,
  action,
}: {
  activity: Activity
  index: number
  /** Optional control rendered under the description (e.g. "choose this hotel"). */
  action?: React.ReactNode
}) {
  const meta = categoryMeta(activity.category)
  const desc = activity.description ? cleanDesc(activity.description) : null

  return (
    <div className="flex gap-3 rounded-2xl border border-[#eee] bg-white p-3 transition hover:border-[#FF4D4D]">
      <div className="relative h-19 w-19 shrink-0 overflow-hidden rounded-xl">
        {activity.mainMediaUrl ? (
          <img
            src={activity.mainMediaUrl}
            alt={activity.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-2xl"
            style={{ background: meta.color }}
            aria-hidden
          >
            {meta.emoji}
          </div>
        )}
        <span className="absolute left-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/45 text-[10px] font-bold text-white backdrop-blur-md">
          {index + 1}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[15px] font-semibold leading-tight text-[#1a1a1a]">{activity.title}</p>
          <span
            className="shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#555]"
            style={{ background: meta.color }}
          >
            {meta.label}
          </span>
        </div>

        {activity.locationName && activity.locationName !== activity.title && (
          <p className="mt-1 flex items-center gap-1 text-xs text-[#888]">
            <PinIcon className="h-3.5 w-3.5 shrink-0 text-[#FF4D4D]" />
            <span className="truncate">{activity.locationName}</span>
          </p>
        )}

        {desc && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#999]">{desc}</p>
        )}

        {activity.sourceUrl && (
          <a
            href={activity.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-[#FF4D4D] hover:underline"
          >
            Voir l'offre
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        )}

        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  )
}
