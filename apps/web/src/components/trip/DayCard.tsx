import { useState } from 'react'
import { ActivityRow } from './ActivityRow'
import { EditControls, type DayEditControls } from './EditControls'
import type { Activity, Day } from './types'
import { formatDate } from './tripUtils'

export function DayCard({
  day,
  onReplace,
  edit,
}: {
  day: Day
  /** Opens the replacement pop-up; omitted while editing. */
  onReplace?: (activity: Activity) => void
  /** Present in edit mode only. */
  edit?: DayEditControls
}) {
  const [isOpen, setIsOpen] = useState(true)

  const activities = day.activities.filter((a) => a.category === 'activité')
  const restaurants = day.activities.filter((a) => a.category === 'restaurant')

  // The planner emits each day as a real route (hotel → matin → déjeuner →
  // après-midi → dîner), so `orderIndex` is the order to display. A draft is
  // already in its edited order.
  const ordered = edit ? day.activities : [...day.activities].sort((a, b) => a.orderIndex - b.orderIndex)

  const summary = [
    activities.length > 0 && `${activities.length} activité${activities.length > 1 ? 's' : ''}`,
    restaurants.length > 0 && `${restaurants.length} restaurant${restaurants.length > 1 ? 's' : ''}`,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="overflow-hidden rounded-[28px] border border-[#eee] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left transition hover:bg-[#faf7f4]"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-flex h-7 shrink-0 items-center rounded-full bg-[#FF4D4D] px-3 text-xs font-bold text-white">
            Jour {day.dayIndex}
          </span>
          {day.targetDate && (
            <span className="shrink-0 text-xs font-medium text-[#888]">
              {formatDate(day.targetDate)}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {summary && <span className="hidden text-xs text-[#aaa] sm:block">{summary}</span>}
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#ddd] text-[#888]">
            <svg
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </button>

      {isOpen && (
        <div className="space-y-2.5 border-t border-[#f0eae3] bg-[#FBF8F5] p-3">
          {ordered.map((act, idx) => (
            <ActivityRow
              key={act.id}
              activity={act}
              index={idx}
              action={
                edit ? (
                  <EditControls
                    activity={act}
                    day={day}
                    days={edit.days}
                    isFirst={idx === 0}
                    isLast={idx === ordered.length - 1}
                    controls={edit}
                  />
                ) : onReplace ? (
                  <button
                    type="button"
                    onClick={() => onReplace(act)}
                    className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-[#ddd] px-3 py-1 text-xs font-semibold text-[#555] transition hover:border-[#FF4D4D] hover:text-[#FF4D4D] active:scale-95"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h13l-3-3M20 17H7l3 3" />
                    </svg>
                    Changer
                  </button>
                ) : undefined
              }
            />
          ))}
          {ordered.length === 0 && (
            <p className="rounded-2xl border border-[#eee] bg-white px-4 py-3 text-xs text-[#888]">
              Aucune activité ce jour.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
