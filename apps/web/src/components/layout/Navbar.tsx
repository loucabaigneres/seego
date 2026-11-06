import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { authClient } from '@/lib/auth-client'

interface NavbarProps {
  /** Extra actions shown to signed-in users, composed by the app layer (e.g. group trips). */
  userActions?: ReactNode
}

export function Navbar({ userActions }: NavbarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: session, isPending } = authClient.useSession()

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const redirectSearch = !isAuthPage && location.pathname !== '/' ? { redirect: location.href } : undefined

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: '/' })
        },
      },
    })
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-1.5 transition active:scale-95">
          <span className="text-xl font-black tracking-tight text-ink">Seego</span>
          <span className="h-2 w-2 rounded-full bg-cta transition group-hover:scale-125" />
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          {isPending ? (
            <div className="h-8 w-24 animate-pulse rounded-full bg-surface" />
          ) : session?.user ? (
            <div className="flex items-center gap-2">
              {userActions}

              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-full border border-line bg-background/70 px-3 py-1.5 shadow-sm transition hover:bg-background active:scale-95"
              >
                <span className="max-w-30px truncate text-xs font-semibold text-ink">
                  {session.user.name || session.user.email}
                </span>
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                title="Se déconnecter"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-line bg-background/70 text-ink-muted shadow-sm transition hover:border-brand hover:bg-ink hover:text-ink-inverse active:scale-90"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                search={redirectSearch}
                className="rounded-full px-3.5 py-2 text-xs font-bold text-ink transition hover:bg-ink/5 active:scale-95"
              >
                Se connecter
              </Link>

              <Link
                to="/register"
                search={redirectSearch}
                className="rounded-full bg-cta px-4 py-2 text-xs font-bold text-ink shadow-md shadow-cta/20 transition hover:brightness-105 active:scale-95"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
