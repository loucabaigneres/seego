import { useEffect, useId, useRef, useState } from 'react'
import { useEntrance } from '../hooks/useEntrance'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { CATEGORY_LABELS, category, cleanDesc, hostnameOf, photosOf, subcategories } from '../lib/item'
import type { DiscoveryItem } from '../types'

interface DetailSheetProps {
  item: DiscoveryItem
  onClose: () => void
  onLike: () => void
  onSkip: () => void
}

function scrollGallery(el: HTMLDivElement | null, direction: 1 | -1) {
  if (!el || el.clientWidth === 0) return
  const current = Math.round(el.scrollLeft / el.clientWidth)
  el.scrollTo({ left: (current + direction) * el.clientWidth, behavior: 'smooth' })
}

/** Full details of a place: photo gallery, description, tags and offer link. */
export function DetailSheet({ item, onClose, onLike, onSkip }: DetailSheetProps) {
  const photos = photosOf(item)
  const [active, setActive] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const shown = useEntrance()
  const titleId = useId()
  const galleryRef = useRef<HTMLDivElement>(null)

  const tags = subcategories(item)
  const cat = category(item)
  const description = cleanDesc(item.description)
  const isLongDescription = description.length > 260
  const priceTag = item.tags?.price
  const price = typeof priceTag === 'string' && priceTag.trim() ? priceTag : null
  const place = [item.city, item.country].filter(Boolean).join(', ')
  const offerHost = hostnameOf(item.url)

  useLockBodyScroll()
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') scrollGallery(galleryRef.current, 1)
      if (e.key === 'ArrowLeft') scrollGallery(galleryRef.current, -1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function onGalleryScroll() {
    const el = galleryRef.current
    if (!el || el.clientWidth === 0) return
    setActive(Math.round(el.scrollLeft / el.clientWidth))
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 sm:items-center sm:p-6 ${
        shown ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92dvh] w-full max-w-120 flex-col overflow-hidden rounded-t-[28px] bg-[#F2EDE8] shadow-2xl transition-transform duration-300 ease-out sm:max-h-[88vh] sm:rounded-[28px]"
        style={{ transform: shown ? 'translateY(0)' : 'translateY(48px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none">
          <div className="relative h-72 bg-[#1a1a1a] sm:h-80">
            <div
              ref={galleryRef}
              onScroll={onGalleryScroll}
              className="flex h-full snap-x snap-mandatory overflow-x-auto scrollbar-none"
            >
              {photos.map((src, i) => (
                <img
                  key={src}
                  src={src}
                  alt={i === 0 ? (item.locationName ?? '') : ''}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  draggable={false}
                  className="h-full w-full shrink-0 snap-center object-cover"
                />
              ))}
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-linear-to-b from-black/45 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-black/45 to-transparent" />
            <div className="pointer-events-none absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/70 sm:hidden" />

            <button
              type="button"
              onClick={onClose}
              autoFocus
              aria-label="Fermer"
              className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white outline-none backdrop-blur-md transition hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white/80 active:scale-90"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => scrollGallery(galleryRef.current, -1)}
                  disabled={active === 0}
                  aria-label="Photo précédente"
                  className="absolute left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1a1a1a] shadow-md transition hover:bg-white active:scale-90 disabled:opacity-0 sm:flex"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => scrollGallery(galleryRef.current, 1)}
                  disabled={active === photos.length - 1}
                  aria-label="Photo suivante"
                  className="absolute right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#1a1a1a] shadow-md transition hover:bg-white active:scale-90 disabled:opacity-0 sm:flex"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m9 18 6-6-6-6" />
                  </svg>
                </button>

                <div className="pointer-events-none absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5" aria-hidden>
                  {photos.map((src, i) => (
                    <span
                      key={src}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        i === active ? 'w-5 bg-white' : 'w-1.5 bg-white/55'
                      }`}
                    />
                  ))}
                </div>
                <span className="pointer-events-none absolute bottom-2.5 right-3 rounded-full bg-black/45 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white backdrop-blur-md">
                  {active + 1} / {photos.length}
                </span>
              </>
            )}
          </div>

          <div className="space-y-6 px-5 pb-6 pt-5">
            <header>
              {place && (
                <p className="flex items-center gap-1.5 text-sm font-medium text-[#FF4D4D]">
                  <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  {place}
                </p>
              )}
              <h2 id={titleId} className="mt-1.5 text-[26px] font-bold leading-tight text-[#1a1a1a]">
                {item.locationName}
              </h2>
              {(cat || price) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {cat && (
                    <span className="rounded-full bg-[#FF4D4D] px-3 py-1 text-xs font-semibold text-white">
                      {CATEGORY_LABELS[cat] ?? cat}
                    </span>
                  )}
                  {price && (
                    <span className="rounded-full border border-[#ddd] bg-white px-3 py-1 text-xs font-semibold text-[#1a1a1a]">
                      Budget <span className="text-[#FF4D4D]">{price}</span>
                    </span>
                  )}
                </div>
              )}
            </header>

            {description && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#888]">À propos</h3>
                <p
                  className={`mt-2 text-[15px] leading-relaxed text-[#555] ${
                    isLongDescription && !expanded ? 'line-clamp-5' : ''
                  }`}
                >
                  {description}
                </p>
                {isLongDescription && (
                  <button
                    type="button"
                    onClick={() => setExpanded((value) => !value)}
                    aria-expanded={expanded}
                    className="mt-1.5 text-sm font-semibold text-[#FF4D4D] hover:underline"
                  >
                    {expanded ? 'Voir moins' : 'Lire la suite'}
                  </button>
                )}
              </section>
            )}

            {tags.length > 0 && (
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#888]">Ce qui t'attend</h3>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-[#ddd] bg-white px-3 py-1.5 text-xs font-semibold capitalize text-[#1a1a1a]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#eee] bg-white px-4 py-3.5 transition hover:border-[#FF4D4D]"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-[#1a1a1a]">Voir l'offre</span>
                  {offerHost && <span className="block truncate text-xs text-[#888]">{offerHost}</span>}
                </span>
                <svg className="h-5 w-5 shrink-0 text-[#FF4D4D]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M8 7h9v9" />
                </svg>
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-[#ddd]/70 bg-[#F2EDE8] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          <button
            type="button"
            onClick={onSkip}
            className="flex h-13 items-center justify-center gap-2 rounded-2xl border border-[#ddd] bg-white py-3.5 text-sm font-semibold text-[#1a1a1a] transition hover:border-[#FF4D4D] hover:text-[#FF4D4D] active:scale-95"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
            Passer
          </button>
          <button
            type="button"
            onClick={onLike}
            className="flex h-13 items-center justify-center gap-2 rounded-2xl bg-[#FF4D4D] py-3.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:brightness-105 active:scale-95"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            J'adore
          </button>
        </div>
      </div>
    </div>
  )
}
