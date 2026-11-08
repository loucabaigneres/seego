import { categoryColors, colors } from '@seego/ui'
import { Document, Image, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
import { apiUrl } from '@/config/env'

// ─── Types (mirrors getTrip output) ──────────────────────────────────────────

type Activity = {
  id: string
  title: string
  locationName: string | null
  description: string | null
  coordinates: string | null
  category: string | null
  orderIndex: number
  mainMediaUrl: string | null
  sourceUrl: string | null
}

type Day = {
  id: string
  dayIndex: number
  targetDate: string | null
  activities: Activity[]
}

type Trip = {
  title: string | null
  destination: string | null
  startDate: string | null
  durationDays: number | null
}

export type TripPdfProps = {
  trip: Trip
  days: Day[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseCoords(wkt: string | null): string | null {
  if (!wkt) return null
  const m = wkt.match(/POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)/i)
  if (!m) return null
  return `${parseFloat(m[2]).toFixed(5)}, ${parseFloat(m[1]).toFixed(5)}`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function cleanDesc(desc: string): string {
  return desc.replace(/\*\*/g, '').replace(/\*/g, '').trim()
}

/**
 * Most catalog image hosts send no `Access-Control-Allow-Origin`, so the PDF
 * renderer cannot read them directly — it fetches them from the browser. The API
 * relays them instead.
 */
function proxiedImage(url: string): string {
  return `${apiUrl}/image-proxy?url=${encodeURIComponent(url)}`
}

const CATEGORY_LABELS: Record<string, { label: string; color: string; tint: string; text: string }> = {
  hotel:      { label: 'Hébergement', color: categoryColors.hotel.fill,      tint: colors.surface, text: colors.ink.DEFAULT },
  'activité': { label: 'Activité',    color: categoryColors.activity.fill,   tint: colors.surface, text: colors.ink.DEFAULT },
  restaurant: { label: 'Restaurant',  color: categoryColors.restaurant.fill, tint: colors.surface, text: colors.ink.DEFAULT },
}

function categoryInfo(cat: string | null) {
  return (
    CATEGORY_LABELS[cat ?? ''] ?? {
      label: cat ?? 'Lieu',
      color: colors.ink.muted,
      tint: colors.surface,
      text: colors.ink.secondary,
    }
  )
}

function daySummary(activities: Activity[]): string {
  const count = (cat: string) => activities.filter((a) => a.category === cat).length
  const nbActivities = count('activité')
  const nbRestaurants = count('restaurant')
  return [
    nbActivities > 0 && `${nbActivities} activité${nbActivities > 1 ? 's' : ''}`,
    nbRestaurants > 0 && `${nbRestaurants} restaurant${nbRestaurants > 1 ? 's' : ''}`,
  ]
    .filter(Boolean)
    .join(' · ')
}

/** Bands stacked above the hero's solid scrim, fading the photo out upwards. */
const SCRIM_BAND_HEIGHT = 7
const SCRIM_BANDS = Array.from({ length: 12 }, (_, i) => ({
  bottom: 62 + i * SCRIM_BAND_HEIGHT,
  // Quadratic fade so the photo comes back cleanly towards the top.
  opacity: Math.round(0.68 * (1 - (i + 1) / 12) ** 2 * 100) / 100,
}))

// ─── Styles ───────────────────────────────────────────────────────────────────
// Same vocabulary as the app: crema surface, raised rounded cards, vino accent.

const s = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    fontFamily: 'Helvetica',
    color: colors.ink.DEFAULT,
    paddingTop: 32,
    paddingBottom: 56,
    paddingHorizontal: 32,
  },

  // ── Hero ──
  hero: {
    height: 210,
    marginBottom: 22,
    borderRadius: 18,
    backgroundColor: colors.ink.DEFAULT,
    position: 'relative',
  },
  heroImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: 18,
    objectFit: 'cover',
  },
  /** Stacked scrims stand in for the app's bottom gradient (no gradients in PDF). */
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  scrimBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 62,
    backgroundColor: 'rgba(26,26,26,.74)',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  heroContent: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 16,
  },
  heroDestination: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: colors.brand,
    marginBottom: 3,
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink.inverse,
  },
  heroPills: {
    flexDirection: 'row',
    marginTop: 8,
  },
  heroPill: {
    fontSize: 8,
    color: colors.ink.inverse,
    backgroundColor: 'rgba(255,255,255,.22)',
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    marginRight: 5,
  },

  // ── Section heading ──
  sectionTitle: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink.muted,
    letterSpacing: 1.2,
    marginBottom: 8,
  },

  // ── Day card ──
  dayCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.surface,
    marginBottom: 14,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  dayHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayPill: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink.inverse,
    backgroundColor: colors.brand,
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 9,
    marginRight: 8,
  },
  dayDate: {
    fontSize: 9,
    color: colors.ink.muted,
  },
  daySummary: {
    fontSize: 8,
    color: colors.ink.muted,
  },
  dayBody: {
    backgroundColor: colors.background,
    padding: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },

  // ── Activity card ──
  activityCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surface,
    padding: 8,
  },
  indexBadge: {
    width: 15,
    height: 15,
    borderRadius: 999,
    backgroundColor: 'rgba(255,77,77,.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginTop: 1,
  },
  indexBadgeText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: colors.brand,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 8,
    marginRight: 9,
    objectFit: 'cover',
  },
  /** Keeps the text column aligned when a place has no picture. */
  thumbnailFallback: {
    width: 52,
    height: 52,
    borderRadius: 8,
    marginRight: 9,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink.DEFAULT,
    flex: 1,
    marginRight: 8,
  },
  categoryBadge: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    borderRadius: 999,
    paddingVertical: 2.5,
    paddingHorizontal: 7,
  },
  locationName: {
    fontSize: 8.5,
    color: colors.ink.muted,
    marginBottom: 2,
  },
  coords: {
    fontSize: 7.5,
    color: colors.ink.muted,
    marginBottom: 3,
  },
  description: {
    fontSize: 8.5,
    color: colors.ink.muted,
    lineHeight: 1.5,
  },
  link: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.brand,
    marginTop: 4,
    textDecoration: 'none',
  },

  // Gap between two activity cards
  activityGap: {
    height: 6,
  },

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 26,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 8,
    color: colors.ink.muted,
  },
  footerBrand: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: colors.ink.muted,
  },
})

// ─── PDF Document ─────────────────────────────────────────────────────────────

export function TripPdfDocument({ trip, days }: TripPdfProps) {
  const itineraryDays = days.filter((d) => d.dayIndex > 0)

  // Cover photo: same pick as the trip page — first itinerary place that has
  // one, else any other place attached to the trip (liked places, hotels).
  const heroImage =
    itineraryDays.flatMap((d) => d.activities).find((a) => a.mainMediaUrl)?.mainMediaUrl ??
    days.flatMap((d) => d.activities).find((a) => a.mainMediaUrl)?.mainMediaUrl ??
    null

  return (
    <Document title={trip.title ?? 'Itinéraire'} author="Seego">
      <Page size="A4" style={s.page}>

        {/* Hero */}
        <View style={s.hero}>
          {heroImage && <Image style={s.heroImage} src={proxiedImage(heroImage)} />}
          {SCRIM_BANDS.map((band) => (
            <View
              key={band.bottom}
              style={[
                s.scrim,
                {
                  bottom: band.bottom,
                  height: SCRIM_BAND_HEIGHT,
                  backgroundColor: `rgba(26,26,26,${band.opacity})`,
                },
              ]}
            />
          ))}
          <View style={s.scrimBottom} />

          <View style={s.heroContent}>
            {trip.destination && (
              <Text style={s.heroDestination}>{trip.destination.toUpperCase()}</Text>
            )}
            <Text style={s.heroTitle}>{trip.title ?? 'Mon voyage'}</Text>

            <View style={s.heroPills}>
              {trip.startDate && <Text style={s.heroPill}>{formatDate(trip.startDate)}</Text>}
              {trip.durationDays ? (
                <Text style={s.heroPill}>
                  {trip.durationDays} jour{trip.durationDays > 1 ? 's' : ''}
                </Text>
              ) : null}
              {itineraryDays.length > 0 && (
                <Text style={s.heroPill}>
                  {itineraryDays.reduce((n, d) => n + d.activities.length, 0)} étapes
                </Text>
              )}
            </View>
          </View>
        </View>

        <Text style={s.sectionTitle}>JOUR PAR JOUR</Text>

        {/* Days */}
        {itineraryDays.map((day) => {
          // Same order as the app: the planner lays each day out as a route.
          const ordered = [...day.activities].sort((a, b) => a.orderIndex - b.orderIndex)
          const summary = daySummary(ordered)

          return (
            <View key={day.id} style={s.dayCard} wrap={false}>
              {/* Day header */}
              <View style={s.dayHeader}>
                <View style={s.dayHeaderLeft}>
                  <Text style={s.dayPill}>Jour {day.dayIndex}</Text>
                  {day.targetDate && <Text style={s.dayDate}>{formatDate(day.targetDate)}</Text>}
                </View>
                {summary !== '' && <Text style={s.daySummary}>{summary}</Text>}
              </View>

              {/* Activities */}
              <View style={s.dayBody}>
                {ordered.map((act, idx) => {
                  const info   = categoryInfo(act.category)
                  const coords = parseCoords(act.coordinates)
                  const desc   = act.description ? cleanDesc(act.description) : null
                  // Activities carry generic stock pictures that add weight without
                  // helping; only places you actually go to get a thumbnail.
                  const showThumbnail = act.category !== 'activité'

                  return (
                    <View key={act.id}>
                      <View style={s.activityCard}>
                        <View style={s.indexBadge}>
                          <Text style={s.indexBadgeText}>{idx + 1}</Text>
                        </View>

                        {showThumbnail &&
                          (act.mainMediaUrl ? (
                            <Image style={s.thumbnail} src={proxiedImage(act.mainMediaUrl)} />
                          ) : (
                            <View style={[s.thumbnailFallback, { backgroundColor: info.tint }]} />
                          ))}

                        <View style={s.activityContent}>
                          <View style={s.activityHeader}>
                            <Text style={s.activityTitle}>{act.title}</Text>
                            <Text
                              style={[
                                s.categoryBadge,
                                { backgroundColor: info.tint, color: info.text },
                              ]}
                            >
                              {info.label.toUpperCase()}
                            </Text>
                          </View>
                          {act.locationName && act.locationName !== act.title && (
                            <Text style={s.locationName}>{act.locationName}</Text>
                          )}
                          {coords && <Text style={s.coords}>GPS : {coords}</Text>}
                          {desc && <Text style={s.description}>{desc}</Text>}
                          {act.sourceUrl && (
                            <Link style={s.link} src={act.sourceUrl}>
                              Voir l'offre en ligne
                            </Link>
                          )}
                        </View>
                      </View>
                      {idx < ordered.length - 1 && <View style={s.activityGap} />}
                    </View>
                  )
                })}
              </View>
            </View>
          )
        })}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text style={s.footerBrand}>
            Seego<Text style={{ color: colors.cta }}>.</Text>
          </Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  )
}
