import { useId } from 'react'
import { useEntrance } from '../hooks/useEntrance'
import { useLockBodyScroll } from '../hooks/useLockBodyScroll'
import { COUNTRY_FLAGS } from '../lib/recommendation'
import type { Destination, LikedPlace, RecommendationOutput, SaveState, Subcategory } from '../types'
import { MatchSummary } from './MatchSummary'
import { ResultState } from './ResultState'

interface ResultOverlayProps {
  query: {
    data: RecommendationOutput | undefined
    isLoading: boolean
    isError: boolean
    refetch: () => unknown
  }
  likes: number
  skips: number
  onClose: () => void
  onRestart: () => void
  onSave: () => void
  saveState: SaveState
}

/** The recommended destination computed from the swipes, and the way to plan the trip. */
export function ResultOverlay({
  query,
  likes,
  skips,
  onClose,
  onRestart,
  onSave,
  saveState,
}: ResultOverlayProps) {
  const shown = useEntrance()
  const titleId = useId()
  const result = query.data
  const top: Destination | undefined = result?.destinations[0]
  const isReady = !!result && result.status === 'ok' && !!top

  useLockBodyScroll()

  return (
    <div
      className={`fixed inset-0 z-100 flex items-end justify-center bg-black/55 backdrop-blur-[2px] transition-opacity duration-300 sm:items-center sm:p-6 ${
        shown ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative flex max-h-[92dvh] w-full max-w-120 flex-col overflow-hidden rounded-t-[28px] bg-[#F2EDE8] shadow-2xl transition-transform duration-300 ease-out sm:max-h-[90vh] sm:rounded-[28px]"
        style={{ transform: shown ? 'translateY(0)' : 'translateY(48px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Fermer"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white outline-none backdrop-blur-md transition hover:bg-black/60 focus-visible:ring-2 focus-visible:ring-white/80 active:scale-90"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>

        {query.isLoading ? (
          <ResultState titleId={titleId} title="On calcule ta destination…" subtitle="Analyse de tes coups de cœur en cours.">
            <span className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#FF4D4D] border-t-transparent" aria-hidden />
          </ResultState>
        ) : query.isError ? (
          <ResultState
            titleId={titleId}
            title="Le calcul n'a pas abouti"
            subtitle="Vérifie ta connexion puis réessaie."
            action={
              <button
                type="button"
                onClick={() => query.refetch()}
                className="rounded-full bg-[#FF4D4D] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:brightness-105 active:scale-95"
              >
                Réessayer
              </button>
            }
          >
            <span className="text-4xl" aria-hidden>📡</span>
          </ResultState>
        ) : !isReady || !top ? (
          <ResultState
            titleId={titleId}
            title="Encore quelques swipes"
            subtitle="Like quelques lieux de plus pour qu'on cerne tes envies."
            action={
              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-[#FF4D4D] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:brightness-105 active:scale-95"
              >
                Continuer à swiper
              </button>
            }
          >
            <span className="text-4xl" aria-hidden>🧭</span>
          </ResultState>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain scrollbar-none">
              <div className="relative h-72 bg-[#1a1a1a] sm:h-80">
                {top.heroImage && (
                  <img src={top.heroImage} alt="" className="h-full w-full object-cover" />
                )}
                <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/85 via-black/25 to-black/20" />
                <div className="pointer-events-none absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/70 sm:hidden" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                    ✈️ Ta destination idéale
                  </span>
                  <h2 id={titleId} className="mt-2 text-5xl font-black leading-none text-white">
                    {top.city}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-white/85">
                    {COUNTRY_FLAGS[top.country] ? `${COUNTRY_FLAGS[top.country]} ` : ''}
                    {top.country}
                  </p>
                </div>
              </div>

              <div className="space-y-6 px-5 pb-6 pt-5">
                <MatchSummary confidence={result!.confidence} likes={likes} seen={likes + skips} />

                {top.likedHere.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#888]">
                      Tes coups de cœur à {top.city}
                    </h3>
                    <ul className="-mx-5 mt-2.5 flex snap-x gap-3 overflow-x-auto px-5 pb-1 scrollbar-none">
                      {top.likedHere.map((place: LikedPlace) => (
                        <li key={place.id} className="w-36 shrink-0 snap-start">
                          <a
                            href={place.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group block overflow-hidden rounded-2xl border border-[#eee] bg-white transition hover:border-[#FF4D4D]"
                          >
                            <div className="h-24 overflow-hidden bg-[#ddd]">
                              <img
                                src={place.mainMediaUrl}
                                alt=""
                                loading="lazy"
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            </div>
                            <div className="px-2.5 py-2">
                              <p className="line-clamp-2 min-h-[2.2rem] text-xs font-semibold leading-snug text-[#1a1a1a]">
                                {place.locationName}
                              </p>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {top.topSubcategories.length > 0 && (
                  <section>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#888]">
                      L'ambiance sur place
                    </h3>
                    <ul className="mt-2.5 flex flex-wrap gap-2">
                      {top.topSubcategories.slice(0, 8).map((sub: Subcategory) => (
                        <li
                          key={sub.name}
                          className="rounded-full border border-[#ddd] bg-white px-3 py-1.5 text-xs font-semibold capitalize text-[#1a1a1a]"
                        >
                          {sub.name}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <section className="flex gap-3 rounded-2xl border border-[#eee] bg-white p-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FF4D4D]/10 text-lg" aria-hidden>
                    🗓️
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#1a1a1a]">Et ensuite ?</h3>
                    <p className="mt-0.5 text-sm leading-relaxed text-[#888]">
                      Choisis tes dates, ton budget et ton rythme : on construit ton itinéraire jour
                      par jour avec les lieux que tu as aimés.
                    </p>
                  </div>
                </section>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#ddd]/70 bg-[#F2EDE8] px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              {saveState.isError && (
                <p role="alert" className="text-center text-xs font-semibold text-[#FF4D4D]">
                  Impossible de créer ton voyage pour le moment. Réessaie dans un instant.
                </p>
              )}
              <button
                type="button"
                onClick={onSave}
                disabled={saveState.isPending}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[#FF4D4D] text-[15px] font-bold text-white shadow-lg shadow-red-500/25 transition hover:brightness-105 active:scale-[0.98] disabled:opacity-70"
              >
                {saveState.isPending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden />
                    Création du voyage…
                  </>
                ) : (
                  <>
                    Planifier mon voyage à {top.city}
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  </>
                )}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-11 rounded-2xl border border-[#ddd] bg-white text-sm font-semibold text-[#1a1a1a] transition hover:border-[#1a1a1a] active:scale-95"
                >
                  Continuer à swiper
                </button>
                <button
                  type="button"
                  onClick={onRestart}
                  className="flex h-11 items-center justify-center gap-1.5 rounded-2xl text-sm font-semibold text-[#888] transition hover:bg-white hover:text-[#1a1a1a] active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5" />
                  </svg>
                  Recommencer
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
