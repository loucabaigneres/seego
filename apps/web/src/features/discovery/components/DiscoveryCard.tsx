import { CATEGORY_LABELS, category, cleanDesc, photosOf, subcategories } from '../lib/item'
import type { DiscoveryItem, DragState, LeavingDirection } from '../types'

export interface CardPointerHandlers {
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void
  onPointerCancel: () => void
}

interface DiscoveryCardProps {
  item: DiscoveryItem
  /** Position in the visible stack, 0 being the top (interactive) card. */
  index: number
  photoIndex: number
  drag: DragState
  leaving: LeavingDirection | null
  pointerHandlers: CardPointerHandlers
}

export function DiscoveryCard({ item, index, photoIndex, drag, leaving, pointerHandlers }: DiscoveryCardProps) {
  const isTop = index === 0
  const photos = photosOf(item)
  const activePhoto = isTop ? Math.min(photoIndex, photos.length - 1) : 0
  const tags = subcategories(item).slice(0, 3)
  const cat = category(item)

  let transform = `translateY(${index * 10}px) scale(${1 - index * 0.04})`
  let transition = 'transform .3s cubic-bezier(.2,.8,.2,1)'
  if (isTop && leaving) {
    const dir = leaving === 'like' ? 1 : -1
    transform = `translate(${dir * 640}px, ${drag.y - 30}px) rotate(${dir * 20}deg)`
    transition = 'transform .32s ease-in, opacity .32s ease-in'
  } else if (isTop && drag.active) {
    transform = `translate(${drag.x}px, ${drag.y * 0.3}px) rotate(${drag.x * 0.05}deg)`
    transition = 'none'
  }

  return (
    <div
      role={isTop ? 'group' : undefined}
      aria-label={isTop ? (item.locationName ?? 'Lieu') : undefined}
      aria-hidden={!isTop}
      className={`absolute inset-0 touch-none select-none overflow-hidden rounded-[28px] bg-[#1a1a1a] shadow-[0_24px_50px_-24px_rgba(26,26,26,0.55)] ${
        isTop ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      style={{ transform, transition, zIndex: 10 - index, opacity: isTop && leaving ? 0 : 1 }}
      onPointerDown={isTop ? pointerHandlers.onPointerDown : undefined}
      onPointerMove={isTop ? pointerHandlers.onPointerMove : undefined}
      onPointerUp={isTop ? pointerHandlers.onPointerUp : undefined}
      onPointerCancel={isTop ? pointerHandlers.onPointerCancel : undefined}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-white/15">
        <svg className="h-16 w-16" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" aria-hidden>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="2" />
          <path strokeLinejoin="round" d="m21 16-5-5-9 9" />
        </svg>
      </div>
      <img
        key={photos[activePhoto]}
        src={photos[activePhoto]}
        alt=""
        loading={isTop ? 'eager' : 'lazy'}
        draggable={false}
        onError={(e) => {
          e.currentTarget.style.visibility = 'hidden'
        }}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-linear-to-b from-black/45 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-black/85 via-black/40 to-transparent" />

      <div className="pointer-events-none absolute inset-x-0 top-0 p-3">
        {photos.length > 1 && (
          <div className="flex gap-1" aria-hidden>
            {photos.map((url, i) => (
              <span
                key={url}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i === activePhoto ? 'bg-white' : 'bg-white/35'
                }`}
              />
            ))}
          </div>
        )}
        {cat && (
          <span className="mt-2.5 inline-flex rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
            {CATEGORY_LABELS[cat] ?? cat}
          </span>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5">
        <div className="flex items-center gap-1.5 text-[13px] font-medium text-white/85">
          <svg className="h-4 w-4 shrink-0 text-[#FF4D4D]" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span className="truncate">{[item.city, item.country].filter(Boolean).join(', ')}</span>
        </div>
        <h2 className="mt-1 line-clamp-2 text-[26px] font-bold leading-[1.15] text-white">
          {item.locationName}
        </h2>
        {item.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-white/75">
            {cleanDesc(item.description)}
          </p>
        )}
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium capitalize text-white backdrop-blur-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <p className="mt-3 flex items-center gap-1 text-[11px] font-medium text-white/55">
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="m6 15 6-6 6 6" />
          </svg>
          Touche la carte pour voir les détails
        </p>
      </div>
    </div>
  )
}
