import type { Activity, Day } from '../types'
import { MoveToDayMenu } from './MoveToDayMenu'

export type DayEditControls = {
  days: Day[]
  onMove: (activityId: string, offset: -1 | 1) => void
  onMoveToDay: (activityId: string, targetDayId: string) => void
  onRemove: (activityId: string) => void
}

const iconButton =
  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[#ddd] bg-white text-[#555] transition hover:border-[#FF4D4D] hover:text-[#FF4D4D] active:scale-90 disabled:cursor-default disabled:opacity-35 disabled:hover:border-[#ddd] disabled:hover:text-[#555]'

export function EditControls({
  activity,
  day,
  days,
  isFirst,
  isLast,
  controls,
}: {
  activity: Activity
  day: Day
  days: Day[]
  isFirst: boolean
  isLast: boolean
  controls: DayEditControls
}) {
  const locked = activity.category === 'hotel'

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <button
        type="button"
        onClick={() => controls.onMove(activity.id, -1)}
        disabled={isFirst}
        aria-label="Monter"
        className={iconButton}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 15 7-7 7 7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => controls.onMove(activity.id, 1)}
        disabled={isLast}
        aria-label="Descendre"
        className={iconButton}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 9-7 7-7-7" />
        </svg>
      </button>

      {locked ? (
        <span className="text-[11px] font-medium text-[#aaa]">Commun à tout le séjour</span>
      ) : (
        <>
          {days.length > 1 && (
            <MoveToDayMenu
              targets={days.filter((d) => d.id !== day.id)}
              onPick={(targetDayId) => controls.onMoveToDay(activity.id, targetDayId)}
            />
          )}
          <button
            type="button"
            onClick={() => controls.onRemove(activity.id)}
            aria-label="Supprimer"
            className={`${iconButton} hover:bg-[#FF4D4D] hover:text-white`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16M10 11v6m4-6v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" />
            </svg>
          </button>
        </>
      )}
    </div>
  )
}
