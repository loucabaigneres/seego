import { Link } from '@tanstack/react-router'

export function TripLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-130 flex-col items-center gap-3 rounded-card border border-brand/15 bg-surface px-8 py-14 text-center">
        <span className="animate-pulse text-4xl" aria-hidden>🧭</span>
        <p className="text-sm font-semibold text-ink-muted">Chargement de ton voyage…</p>
      </div>
    </div>
  )
}

export function TripNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-130 flex-col items-center gap-3 rounded-card border border-brand/15 bg-surface px-8 py-14 text-center">
        <span className="text-4xl" aria-hidden>🧳</span>
        <p className="text-sm font-semibold text-ink">Voyage introuvable.</p>
        <Link
          to="/discovery"
          className="mt-1 rounded-full bg-brand px-6 py-3 text-sm font-semibold text-accent shadow-lg shadow-brand/25 transition hover:brightness-105 active:scale-95"
        >
          Retour à la découverte
        </Link>
      </div>
    </div>
  )
}

export function GeneratingCard() {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 rounded-card border border-brand/15 bg-surface px-8 py-10 text-center">
      <span className="animate-pulse text-4xl" aria-hidden>✨</span>
      <p className="text-sm font-semibold text-ink-muted">
        Analyse de tes préférences et optimisation géographique…
      </p>
    </div>
  )
}
