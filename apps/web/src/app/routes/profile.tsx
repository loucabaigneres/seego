import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { PageSpinner } from '@/components/PageSpinner';
import { InspirationList } from '@/features/inspiration/components/InspirationList';
import { MyTripsList } from '@/features/profile/components/MyTripsList';
import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileSettingsForm } from '@/features/profile/components/ProfileSettingsForm';
import { ProfileStats } from '@/features/profile/components/ProfileStats';
import { ProfileTabs } from '@/features/profile/components/ProfileTabs';
import { useProfile } from '@/features/profile/hooks/useProfile';
import type { ProfileTab } from '@/features/profile/types';

export const Route = createFileRoute('/profile')({
  component: ProfilePage,
});

function ProfilePage() {
  const { isSignedIn, isLoading, profile, trips, isLoadingTrips, logout } = useProfile();
  const [activeTab, setActiveTab] = useState<ProfileTab>('trips');

  if (isLoading) {
    return <PageSpinner label="Chargement de votre profil…" />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <ProfileHeader profile={profile} onLogout={logout} />
      <ProfileStats profile={profile} />
      <ProfileTabs active={activeTab} onChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'trips' ? (
          <MyTripsList trips={trips} isLoading={isLoadingTrips} />
        ) : activeTab === 'imports' ? (
          <div>
            <InspirationList enabled={isSignedIn} />
            <Link
              to="/importVideo"
              className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#FF4D4D] py-3.5 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition hover:brightness-105 active:scale-95"
            >
              Ajouter une inspiration
            </Link>
          </div>
        ) : (
          <ProfileSettingsForm initialName={profile?.user?.name ?? ''} />
        )}
      </div>
    </div>
  );
}
