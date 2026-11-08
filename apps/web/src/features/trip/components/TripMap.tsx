import 'leaflet/dist/leaflet.css';

import { colors } from '@seego/ui';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { CAT_EMOJI, CAT_LABEL, catStyle } from '../lib/categories';

// ─── Constants ────────────────────────────────────────────────────────────────

/** White pictogram drawn inside each pin, authored on a 24×24 grid. */
const CAT_GLYPH: Record<string, string> = {
  hotel:
    '<rect x="3" y="7" width="1.9" height="10.5" rx=".95"/><rect x="3" y="12.4" width="18" height="5.1" rx="1.2"/><rect x="5.6" y="8.4" width="5.6" height="3.3" rx="1.2"/>',
  'activité': '<path d="M2.5 19 8 10l3 3.5L15.5 7 21.5 19z"/>',
  restaurant:
    '<rect x="5.4" y="2.5" width="1.5" height="6.2" rx=".75"/><rect x="9.1" y="2.5" width="1.5" height="6.2" rx=".75"/><path d="M5.4 8.2h5.2v.9a3 3 0 0 1-1.9 2.8v9.6H7.3v-9.6a3 3 0 0 1-1.9-2.8z"/><path d="M17.6 2.5v19h-1.7v-8.8H14V8.8c0-2.6 1.4-5 3.6-6.3z"/>',
}

const DEFAULT_GLYPH = '<circle cx="12" cy="12" r="3.6"/>'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseWkt(wkt: string | null): [number, number] | null {
  if (!wkt) return null
  const m = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i)
  if (!m) return null
  return [parseFloat(m[2]), parseFloat(m[1])]
}

function makeIcon(category: string | null, active = false) {
  const { fill, ink } = catStyle(category)
  const glyph = CAT_GLYPH[category ?? ''] ?? DEFAULT_GLYPH

  // Resting discs carry the category colour with a white glyph; the selected
  // one inverts to a white disc. `ink` is the darker hue, used whenever the
  // colour sits on white and needs the extra contrast.
  const body   = active ? colors.background : fill
  const ring   = active ? ink    : colors.background
  const glyphC = active ? ink    : colors.background

  // Filter ids must differ per appearance: duplicate ids across markers would
  // all resolve to the first one in the DOM.
  const uid = `${(category ?? 'default').replace(/[^a-z0-9]/gi, '') || 'default'}${active ? '-a' : ''}`

  const w = active ? 40 : 32

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${w}" viewBox="0 0 34 34">
    <defs>
      <filter id="sh-${uid}" x="-40%" y="-40%" width="180%" height="180%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.4" flood-color="#000" flood-opacity=".2"/>
      </filter>
    </defs>
    <g filter="url(#sh-${uid})">
      <circle cx="17" cy="17" r="15" fill="${body}" stroke="${ring}" stroke-width="2"/>
    </g>
    <g transform="translate(9.56 9.56) scale(.62)" fill="${glyphC}">${glyph}</g>
  </svg>`

  // A disc marks its spot from the centre, unlike a teardrop that points with
  // its tip.
  return L.divIcon({
    html:        svg,
    className:   'tm-pin',
    iconSize:    [w, w],
    iconAnchor:  [w / 2, w / 2],
    popupAnchor: [0, -w / 2],
  })
}

function cleanDesc(s: string) {
  return s.replace(/\*\*/g, '').replace(/\*/g, '').trim()
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Activity = {
  id:           string
  title:        string
  locationName: string | null
  description:  string | null
  coordinates:  string | null
  category:     string | null
  mainMediaUrl: string | null
  sourceUrl:    string | null
}

type Day = {
  id:         string
  dayIndex:   number
  targetDate: string | null
  activities: Activity[]
}

type ActivePin = { activity: Activity; dayIndex: number }
type MarkerMeta = { marker: L.Marker; dayIndex: number; category: string | null }

// ─── Sub-components ───────────────────────────────────────────────────────────

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
    </svg>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface TripMapProps {
  days: Day[]
  /** Day / category filters, owned by the page so the day list stays in sync with the map. */
  selectedDay: number | null
  selectedCategory: string | null
  /** Tailwind classes sizing the map canvas. */
  heightClass?: string
}

export function TripMap({ days, selectedDay, selectedCategory, heightClass = 'h-100' }: TripMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<L.Map | null>(null)
  const markersRef   = useRef<Map<string, MarkerMeta>>(new Map())

  const [activePin,         setActivePin]         = useState<ActivePin | null>(null)

  // ── Init map ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: true })
    mapRef.current = map
    const markers = markersRef.current

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map)

    const bounds: [number, number][] = []

    for (const day of days) {
      for (const act of day.activities) {
        const coords = parseWkt(act.coordinates)
        if (!coords) continue

        bounds.push(coords)

        const marker = L.marker(coords, { icon: makeIcon(act.category), riseOnHover: true }).addTo(map)
        markers.set(act.id, { marker, dayIndex: day.dayIndex, category: act.category })

        // Built as a text node: titles come from scraped data and must not be
        // parsed as HTML.
        const label = document.createElement('span')
        label.textContent = act.locationName ?? act.title
        marker.bindTooltip(label, {
          direction: 'top',
          offset:    [0, -18],
          className: 'tm-tooltip',
        })

        marker.on('click', () => {
          setActivePin((prev) =>
            prev?.activity.id === act.id ? null : { activity: act, dayIndex: day.dayIndex },
          )
        })
      }
    }

    map.on('click', (e) => {
      if (!(e.originalEvent.target as HTMLElement).closest('.leaflet-marker-icon')) {
        setActivePin(null)
      }
    })

    if (bounds.length > 0) map.fitBounds(bounds, { padding: [40, 40] })
    else map.setView([48.8566, 2.3522], 5)

    return () => {
      map.remove()
      mapRef.current = null
      markers.clear()
    }
  }, [days])

  // ── Sync marker visibility + icon ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    for (const [id, entry] of markersRef.current) {
      const { marker, dayIndex, category } = entry
      const isActive      = activePin?.activity.id === id
      const visibleByDay  = selectedDay      === null || dayIndex  === selectedDay
      const visibleByCat  = selectedCategory === null || category  === selectedCategory
      const visible       = visibleByDay && visibleByCat

      if (visible  && !map.hasLayer(marker)) marker.addTo(map)
      if (!visible &&  map.hasLayer(marker)) marker.remove()
      if (visible)                           marker.setIcon(makeIcon(category, isActive))
    }

    // Close panel if the active pin became hidden
    if (activePin) {
      const entry = markersRef.current.get(activePin.activity.id)
      if (entry) {
        const gone =
          (selectedDay      !== null && entry.dayIndex  !== selectedDay) ||
          (selectedCategory !== null && entry.category  !== selectedCategory)
        if (gone) setActivePin(null)
      }
    }
  }, [activePin, selectedDay, selectedCategory])

  const cat          = activePin?.activity.category ?? null
  const catTint      = catStyle(cat).tint
  const categoryLabel = CAT_LABEL[cat ?? ''] ?? cat ?? ''
  const emoji        = CAT_EMOJI[cat ?? ''] ?? '📍'
  const desc         = activePin?.activity.description ? cleanDesc(activePin.activity.description) : null

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="w-full">

      {/* ── Map card ── */}
      <div className="relative overflow-hidden z-0 rounded-card border border-brand/15 bg-surface">
        <div ref={containerRef} className={`w-full ${heightClass}`} />

        {/* ── Detail panel ── */}
        {activePin && (
          <div className="absolute inset-x-3 bottom-3 z-1000 overflow-hidden rounded-card border border-brand/15 bg-surface shadow-[0_8px_32px_rgba(0,0,0,0.14)]">
            {/* Image */}
            {activePin.activity.mainMediaUrl && (
              <div className="relative h-36 w-full overflow-hidden">
                <img
                  src={activePin.activity.mainMediaUrl}
                  alt={activePin.activity.title}
                  className="h-full w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink/30 to-transparent" />
              </div>
            )}

            <div className="p-3.5">
              {/* Badges + close */}
              <div className="mb-2.5 flex items-center gap-2">
                <span className="inline-flex h-6 items-center rounded-full bg-brand px-3 text-xs font-bold text-accent">
                  Jour {activePin.dayIndex}
                </span>
                <span
                  className="inline-flex h-6 items-center rounded-full px-3 text-xs font-semibold text-ink-secondary"
                  style={{ background: catTint }}
                >
                  {emoji} {categoryLabel}
                </span>
                <button
                  type="button"
                  onClick={() => setActivePin(null)}
                  className="ml-auto flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-[11px] text-ink-muted transition hover:border-brand hover:text-brand"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>

              {/* Title */}
              <p className="text-[16px] font-bold leading-snug text-ink">
                {activePin.activity.locationName ?? activePin.activity.title}
              </p>

              {/* Location sub-label */}
              {activePin.activity.locationName &&
                activePin.activity.locationName !== activePin.activity.title && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-ink-muted">
                    <PinIcon className="h-3.5 w-3.5 shrink-0 text-brand" />
                    <span className="truncate">{activePin.activity.title}</span>
                  </p>
                )}

              {/* Description */}
              {desc && (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-ink-muted">{desc}</p>
              )}

              {/* CTA */}
              {activePin.activity.sourceUrl && (
                <a
                  href={activePin.activity.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  Voir l'offre
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
