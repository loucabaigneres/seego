import { Link } from '@tanstack/react-router'

export function TripLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F2EDE8] px-4">
      <div className="flex w-full max-w-130 flex-col items-center gap-3 rounded-[28px] border border-[#eee] bg-white px-8 py-14 text-center shadow-sm">
        <span className="animate-pulse text-4xl" aria-hidden>🧭</span>
        <p className="text-sm font-semibold text-[#888]">Chargement de ton voyage…</p>
      </div>
    </div>
  )
}

export function TripNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F2EDE8] px-4">
      <div className="flex w-full max-w-130 flex-col items-center gap-3 rounded-[28px] border border-[#eee] bg-white px-8 py-14 text-center shadow-sm">
        <span className="text-4xl" aria-hidden>🧳</span>
        <p className="text-sm font-semibold text-[#1a1a1a]">Voyage introuvable.</p>
        <Link
          to="/discovery"
          className="mt-1 rounded-full bg-[#FF4D4D] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:brightness-105 active:scale-95"
        >
          Retour à la découverte
        </Link>
      </div>
    </div>
  )
}

export function GeneratingCard() {
  return (
    <div className="mt-4 flex flex-col items-center gap-2 rounded-[28px] border border-[#eee] bg-white px-8 py-10 text-center shadow-sm">
      <span className="animate-pulse text-4xl" aria-hidden>✨</span>
      <p className="text-sm font-semibold text-[#888]">
        Analyse de tes préférences et optimisation géographique…
      </p>
    </div>
  )
}
