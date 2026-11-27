import { Redirect } from 'expo-router';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { DeleteAccountForm } from '@/features/auth/components/DeleteAccountForm';
import { SettingsHeader } from '@/features/profile/components/SettingsHeader';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { LoadingState, Screen } from '@/ui';

export default function DeleteAccountScreen() {
  const { isSessionPending, isSignedIn } = useProfile();

  if (isSessionPending) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }
  if (!isSignedIn) return <Redirect href="/profile" />;

  return (
    // Same as the auth screens: lifts the confirmation field above the keyboard on iOS.
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Screen scroll contentClassName="gap-8">
        <SettingsHeader title="Supprimer mon compte" />
        <DeleteAccountForm />
      </Screen>
    </KeyboardAvoidingView>
  );
}
