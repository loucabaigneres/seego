import type { Profile } from '../types';

export function ProfileHeader({ profile, onLogout }: { profile: Profile | undefined; onLogout: () => void }) {
  return (
    <div className="flex flex-col gap-6 rounded-card bg-surface p-6 sm:p-8 border border-brand/15 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand text-2xl font-black text-accent uppercase shadow-lg shadow-brand/20">
          {profile?.user?.name?.charAt(0) || profile?.user?.email?.charAt(0) || 'U'}
        </div>
        <div>
          <h1 className="text-2xl font-display font-normal text-ink">
            {profile?.user?.name || 'Explorateur'}
          </h1>
          <p className="text-sm font-medium text-ink-muted">{profile?.user?.email}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={onLogout}
        className="rounded-2xl border border-line-strong bg-background px-5 py-2.5 text-sm font-semibold text-ink-muted hover:text-brand hover:border-brand/30 transition active:scale-95 cursor-pointer"
      >
        Déconnexion
      </button>
    </div>
  );
}
