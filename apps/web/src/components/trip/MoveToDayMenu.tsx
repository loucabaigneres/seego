import { useEffect, useId, useRef, useState } from 'react';
import { formatDate } from './tripUtils';
import type { Day } from './types';

/**
 * "Déplacer vers…" dropdown styled like the rest of the page.
 *
 * The menu is positioned `fixed` from the trigger's rect: day cards clip their
 * overflow, so an absolutely positioned menu would be cut on the last rows.
 */
export function MoveToDayMenu({ targets, onPick }: { targets: Day[]; onPick: (dayId: string) => void }) {
  const [anchor, setAnchor] = useState<{ left: number; top?: number; bottom?: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useEffect(() => {
    if (!anchor) return
    const close = () => setAnchor(null)
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node
      if (!menuRef.current?.contains(target) && !triggerRef.current?.contains(target)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointer)
    window.addEventListener('keydown', onKey)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    menuRef.current?.querySelector('button')?.focus()
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [anchor])

  const toggle = () => {
    if (anchor) return setAnchor(null)
    const rect = triggerRef.current!.getBoundingClientRect()
    const menuWidth = 208
    const left = Math.max(16, Math.min(rect.left, window.innerWidth - menuWidth - 16))
    // Open upwards when the trigger sits in the lower half of the screen.
    setAnchor(
      rect.bottom > window.innerHeight / 2
        ? { left, bottom: window.innerHeight - rect.top + 6 }
        : { left, top: rect.bottom + 6 },
    )
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={anchor !== null}
        aria-controls={anchor ? menuId : undefined}
        className={`inline-flex h-8 cursor-pointer items-center gap-1 rounded-full border bg-white pl-3 pr-2 text-xs font-semibold transition active:scale-95 ${
          anchor ? 'border-[#FF4D4D] text-[#FF4D4D]' : 'border-[#ddd] text-[#555] hover:border-[#FF4D4D] hover:text-[#FF4D4D]'
        }`}
      >
        Déplacer vers…
        <svg
          className={`h-3.5 w-3.5 transition-transform ${anchor ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {anchor && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          style={{ left: anchor.left, top: anchor.top, bottom: anchor.bottom }}
          className="fixed z-2000 max-h-64 w-52 overflow-y-auto rounded-2xl border border-[#eee] bg-white p-1.5 shadow-[0_18px_40px_-16px_rgba(26,26,26,0.4)] scrollbar-thin"
        >
          <p className="px-2.5 pb-1.5 pt-1 text-[10px] font-bold uppercase tracking-wider text-[#aaa]">
            Déplacer vers
          </p>
          {targets.map((d) => (
            <button
              key={d.id}
              type="button"
              role="menuitem"
              onClick={() => {
                setAnchor(null)
                onPick(d.id)
              }}
              className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left outline-none transition hover:bg-[#FBF3EF] focus-visible:bg-[#FBF3EF]"
            >
              <span className="inline-flex h-6 items-center rounded-full bg-[#FF4D4D] px-2.5 text-[11px] font-bold text-white">
                Jour {d.dayIndex}
              </span>
              <span className="truncate text-[11px] font-medium text-[#888]">
                {d.targetDate
                  ? formatDate(d.targetDate)
                  : `${d.activities.length} lieu${d.activities.length > 1 ? 'x' : ''}`}
              </span>
            </button>
          ))}
        </div>
      )}
    </>
  )
}
