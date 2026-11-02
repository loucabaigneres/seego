import type { Profile } from '../types';

export function ProfileHeader({ profile, onLogout }: { profile: Profile | undefined; onLogout: () => void }) {
  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-[#eee] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF4D4D] text-2xl font-black text-white uppercase shadow-lg shadow-red-500/20">
          {profile?.user?.name?.charAt(0) || profile?.user?.email?.charAt(0) || 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1a1a1a]">
            {profile?.user?.name || 'Explorateur'}
          </h1>
          <p className="text-sm font-medium text-[#888]">{profile?.user?.email}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="rounded-2xl border border-[#ddd] bg-white px-5 py-2.5 text-sm font-semibold text-[#888] hover:text-[#FF4D4D] hover:border-[#FF4D4D]/30 transition active:scale-95 cursor-pointer"
      >
        Déconnexion
      </button>
    </div>
  );
}
