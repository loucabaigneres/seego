import { Redirect, router } from 'expo-router';

import { useSignOut } from '@/features/auth/hooks/useSignOut';
import { AccountEmail } from '@/features/profile/components/AccountEmail';
import { EditNameForm } from '@/features/profile/components/EditNameForm';
import { SettingsHeader } from '@/features/profile/components/SettingsHeader';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { Button, LoadingState, Screen } from '@/ui';
import { SignOutIcon } from '@/ui/icons';

export default function SettingsScreen() {
  const { isSessionPending, isSignedIn, profile } = useProfile();
  const { signOut, isSigningOut } = useSignOut({
    onSignedOut: () => router.dismissTo('/profile'),
  });

  if (isSessionPending) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  if (!isSignedIn) return <Redirect href="/profile" />;

  return (
    <Screen scroll contentClassName="gap-7">
      <SettingsHeader />
      <EditNameForm currentName={profile?.user?.name} />
      <AccountEmail email={profile?.user?.email} />
      <Button
        label="Se déconnecter"
        variant="outline"
        icon={SignOutIcon}
        loading={isSigningOut}
        onPress={signOut}
        className="mt-auto"
      />
    </Screen>
  );
}
