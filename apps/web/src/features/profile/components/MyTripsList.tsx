import { Link } from '@tanstack/react-router';
import type { ProfileTrip } from '../types';

export function MyTripsList({ trips, isLoading }: { trips: ProfileTrip[] | undefined; isLoading: boolean }) {
  return (
    <div className="space-y-3">
      {isLoading ? (
        <p className="p-6 text-center text-sm font-medium text-ink-muted">Chargement de vos voyages…</p>
      ) : trips && trips.length > 0 ? (
        trips.map((item) => (
          <Link
            key={item.id}
            to="/trip/$tripId"
            params={{ tripId: item.id }}
            className="flex items-center justify-between rounded-card bg-surface p-5 border border-brand/15 hover:border-brand/50 transition active:scale-[0.99]"
          >
            <div>
              <h3 className="font-bold text-ink">
                {item.title || `Voyage à ${item.destination}`}
              </h3>
              <p className="mt-0.5 text-xs text-ink-muted">Destination : {item.destination}</p>
            </div>
            <span className="rounded-full bg-brand/10 px-3.5 py-1 text-xs font-bold text-brand capitalize">
              {item.status}
            </span>
          </Link>
        ))
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-background p-10 border border-dashed border-line-strong text-center shadow-sm">
          <span className="text-4xl">🗺️</span>
          <p className="text-sm font-semibold text-ink">Tu n'as pas encore d'itinéraire enregistré.</p>
          <Link
            to="/discovery"
            className="mt-2 rounded-full bg-cta px-6 py-3 text-sm font-semibold text-ink shadow-lg shadow-cta/25 transition active:scale-95"
          >
            Découvrir des destinations
          </Link>
        </div>
      )}
    </div>
  );
}
