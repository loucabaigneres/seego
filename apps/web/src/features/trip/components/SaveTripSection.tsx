import { Link } from '@tanstack/react-router'

export function SaveTripSection({
  tripId,
  isLoggedIn,
  isSaved,
  isSaving,
  showSavedBanner,
  onSave,
  onCloseBanner,
}: {
  tripId: string
  isLoggedIn: boolean
  /** The trip is already finalized and owned by the current user. */
  isSaved: boolean
  isSaving: boolean
  showSavedBanner: boolean
  onSave: () => void
  onCloseBanner: () => void
}) {
  return (
    <>
    {/* ── Sauvegarde ── */}
    {!isSaved ? (
      <div>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FF4D4D] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
        >
          {isLoggedIn ? (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 4.5h12a1 1 0 0 1 1 1v14l-7-3.5L5 19.5v-14a1 1 0 0 1 1-1Z" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 10V7a5 5 0 0 1 10 0v3M6 10h12v10H6V10Z" />
            </svg>
          )}
          {isSaving
            ? 'Enregistrement…'
            : isLoggedIn
              ? 'Enregistrer dans mon profil'
              : 'Se connecter pour enregistrer'}
        </button>

        {!isLoggedIn && (
          <p className="mt-3 text-center text-xs text-[#888]">
            Pas encore de compte ?{' '}
            <Link
              to="/register"
              search={{ redirect: `/trip/${tripId}?save=true` }}
              className="font-bold text-[#FF4D4D] hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        )}
      </div>
    ) : (
      <p className="mt-4 flex items-center justify-center gap-1.5 rounded-full border border-[rgba(46,204,113,.3)] bg-[rgba(46,204,113,.12)] px-4 py-2.5 text-xs font-semibold text-[#27ae60]">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
        </svg>
        Sauvegardé dans ton profil
      </p>
    )}

    {/* Notification de confirmation */}
    {showSavedBanner && (
      <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[rgba(46,204,113,.3)] bg-[#e8f8f0] p-4 text-sm font-semibold text-[#27ae60] shadow-sm">
        <span className="flex items-center gap-2">
          <span aria-hidden>🎉</span>
          <span>Te voilà connecté ! Ton voyage a été enregistré dans ton profil.</span>
        </span>
        <button
          type="button"
          onClick={() => onCloseBanner()}
          className="shrink-0 cursor-pointer rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#27ae60] transition hover:bg-white"
        >
          Fermer
        </button>
      </div>
    )}
    </>
  )
}
