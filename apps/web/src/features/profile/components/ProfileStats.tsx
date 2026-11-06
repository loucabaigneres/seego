import type { Profile } from '../types';

export function ProfileStats({ profile }: { profile: Profile | undefined }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <div className="rounded-card bg-surface p-6 border border-brand/15">
        <div className="text-3xl font-extrabold text-ink">{profile?.stats?.tripsCount ?? 0}</div>
        <div className="mt-0.5 text-xs font-semibold text-ink-muted">Voyages créés</div>
      </div>
      <div className="rounded-card bg-surface p-6 border border-brand/15">
        <div className="text-3xl font-extrabold text-brand">{profile?.stats?.likedPlacesCount ?? 0}</div>
        <div className="mt-0.5 text-xs font-semibold text-ink-muted">Lieux likés</div>
      </div>
    </div>
  );
}
