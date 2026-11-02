import type { Profile } from '../types';

export function ProfileStats({ profile }: { profile: Profile | undefined }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3">
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-[#eee]">
        <div className="text-3xl font-extrabold text-[#1a1a1a]">{profile?.stats?.tripsCount ?? 0}</div>
        <div className="mt-0.5 text-xs font-semibold text-[#888]">Voyages créés</div>
      </div>
      <div className="rounded-3xl bg-white p-6 shadow-sm border border-[#eee]">
        <div className="text-3xl font-extrabold text-[#FF4D4D]">{profile?.stats?.likedPlacesCount ?? 0}</div>
        <div className="mt-0.5 text-xs font-semibold text-[#888]">Lieux likés</div>
      </div>
    </div>
  );
}
