import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useDeleteTrip } from '../hooks/useDeleteTrip';
import type { ProfileTrip } from '../types';

export function MyTripsList({ trips, isLoading }: { trips: ProfileTrip[] | undefined; isLoading: boolean }) {
  const { deleteTrip, deletingTripId, error } = useDeleteTrip();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {error && <p className="rounded-xl bg-red-50 p-3 text-center text-xs font-medium text-[#FF4D4D]">{error}</p>}
      {isLoading ? (
        <p className="p-6 text-center text-sm font-medium text-[#888]">Chargement de vos voyages…</p>
      ) : trips && trips.length > 0 ? (
        trips.map((item) => {
          const label = item.title || `Voyage à ${item.destination}`;
          const isDeleting = deletingTripId === item.id;

          if (confirmingId === item.id) {
            return (
              <div
                key={item.id}
                className="flex flex-col gap-3 rounded-2xl border border-[#FF4D4D]/40 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-sm text-[#1a1a1a]">
                  Supprimer <span className="font-bold">{label}</span> ? Cette action est définitive.
                </p>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setConfirmingId(null)}
                    className="flex-1 cursor-pointer rounded-xl border border-[#ddd] bg-white px-4 py-2 text-xs font-semibold text-[#1a1a1a] transition hover:bg-black/5 sm:flex-none"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => deleteTrip(item.id, { onSuccess: () => setConfirmingId(null) })}
                    className="flex-1 cursor-pointer rounded-xl bg-[#FF4D4D] px-4 py-2 text-xs font-bold text-white shadow-sm shadow-red-500/25 transition hover:brightness-105 active:scale-95 disabled:opacity-50 sm:flex-none"
                  >
                    {isDeleting ? 'Suppression…' : 'Supprimer'}
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded-2xl border border-[#eee] bg-white shadow-sm transition hover:border-[#FF4D4D]/50"
            >
              <Link
                to="/trip/$tripId"
                params={{ tripId: item.id }}
                className="flex min-w-0 flex-1 items-center justify-between gap-3 p-5 transition active:scale-[0.99]"
              >
                <div className="min-w-0">
                  <h3 className="truncate font-bold text-[#1a1a1a]">{label}</h3>
                  <p className="mt-0.5 text-xs text-[#888]">Destination : {item.destination}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#fee] px-3.5 py-1 text-xs font-bold text-[#FF4D4D] capitalize">
                  {item.status}
                </span>
              </Link>
              <button
                type="button"
                aria-label={`Supprimer ${label}`}
                title="Supprimer ce voyage"
                onClick={() => setConfirmingId(item.id)}
                className="mr-3 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#888] transition hover:bg-red-50 hover:text-[#FF4D4D]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-white p-10 border border-dashed border-[#ddd] text-center shadow-sm">
          <span className="text-4xl">🗺️</span>
          <p className="text-sm font-semibold text-[#1a1a1a]">Tu n'as pas encore d'itinéraire enregistré.</p>
          <Link
            to="/discovery"
            className="mt-2 rounded-full bg-[#FF4D4D] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition active:scale-95"
          >
            Découvrir des destinations
          </Link>
        </div>
      )}
    </div>
  );
}
