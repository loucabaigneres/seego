import { Link } from '@tanstack/react-router';
import type { ProfileTrip } from '../types';

export function MyTripsList({ trips, isLoading }: { trips: ProfileTrip[] | undefined; isLoading: boolean }) {
  return (
    <div className="space-y-3">
      {isLoading ? (
        <p className="p-6 text-center text-sm font-medium text-[#888]">Chargement de vos voyages…</p>
      ) : trips && trips.length > 0 ? (
        trips.map((item) => (
          <Link
            key={item.id}
            to="/trip/$tripId"
            params={{ tripId: item.id }}
            className="flex items-center justify-between rounded-2xl bg-white p-5 border border-[#eee] shadow-sm hover:border-[#FF4D4D]/50 transition active:scale-[0.99]"
          >
            <div>
              <h3 className="font-bold text-[#1a1a1a]">
                {item.title || `Voyage à ${item.destination}`}
              </h3>
              <p className="mt-0.5 text-xs text-[#888]">Destination : {item.destination}</p>
            </div>
            <span className="rounded-full bg-[#fee] px-3.5 py-1 text-xs font-bold text-[#FF4D4D] capitalize">
              {item.status}
            </span>
          </Link>
        ))
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
