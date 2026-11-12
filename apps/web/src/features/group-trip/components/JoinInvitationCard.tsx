import { Link } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { useJoinGroupTrip } from '../hooks/useJoinGroupTrip'

/** Landing card of an invite link: join right away, or sign in / sign up first. */
export function JoinInvitationCard({ inviteCode }: { inviteCode: string }) {
  const { data: session, isPending: isSessionLoading } = authClient.useSession()
  const { join, isJoining, error: joinError } = useJoinGroupTrip()

  if (isSessionLoading) {
    return (
      <div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-65px)] items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-card border border-brand/15 bg-surface p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 text-brand">
          <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.999-3.199a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
          </svg>
        </div>

        <h1 className="text-xl font-display font-normal text-ink">Rejoindre un voyage</h1>
        <p className="mt-1 text-xs text-ink-muted">
          Tu as reçu une invitation pour participer à une aventure à plusieurs.
        </p>

        <div className="my-5 rounded-2xl bg-background/60 p-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">Code d'invitation</span>
          <p className="text-lg font-black tracking-widest text-ink">{inviteCode}</p>
        </div>

        {joinError && (
          <div className="mb-4 rounded-xl border border-brand/20 bg-surface p-3 text-xs font-semibold text-brand">
            {joinError.message}
          </div>
        )}

        {session?.user ? (
          <button
            type="button"
            disabled={isJoining}
            onClick={() => join(inviteCode)}
            className="w-full cursor-pointer rounded-2xl bg-brand py-3.5 text-xs font-bold text-accent shadow-lg shadow-brand/25 transition hover:brightness-105 active:scale-95 disabled:opacity-50"
          >
            {isJoining ? 'Connexion au groupe…' : 'Rejoindre le voyage'}
          </button>
        ) : (
          <div className="space-y-2.5">
            <Link
              to="/login"
              search={{ redirect: `/join/${inviteCode}` }}
              className="block w-full rounded-2xl bg-ink py-3 text-xs font-bold text-ink-inverse transition hover:bg-ink"
            >
              Se connecter pour rejoindre
            </Link>
            <Link
              to="/register"
              search={{ redirect: `/join/${inviteCode}` }}
              className="block w-full rounded-card border border-brand/15 bg-surface py-3 text-xs font-bold text-ink transition hover:bg-background"
            >
              Créer un compte
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
