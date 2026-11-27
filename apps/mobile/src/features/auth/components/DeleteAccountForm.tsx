import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Button, Notice, Text, TextField } from '@/ui';
import { TrashIcon } from '@/ui/icons';

import { useDeleteAccount } from '../hooks/useDeleteAccount';
import { useSignOut } from '../hooks/useSignOut';
import { DELETE_CONFIRMATION, isDeleteConfirmed } from '../lib/delete-account';

const ERASED = [
  'ton profil et tes informations de connexion',
  'tes voyages, avec leurs jours et activités',
  'tes lieux likés et tes inspirations importées',
];

export function DeleteAccountForm() {
  const [typed, setTyped] = useState('');
  const { deleteAccount, isPending, needsReauth, error } = useDeleteAccount({
    onDeleted: () => router.dismissTo('/profile'),
  });
  // A session older than 24 h must sign in again: sign out, then open the sign-in screen.
  const { signOut, isSigningOut } = useSignOut({
    onSignedOut: () => router.replace('/auth/sign-in'),
  });

  return (
    <View className="gap-6">
      <View className="gap-3">
        <Text>La suppression est définitive. Seront effacés :</Text>
        <View className="gap-1">
          {ERASED.map((item) => (
            <Text key={item} tone="secondary">
              • {item}
            </Text>
          ))}
        </View>
        <Text tone="secondary">
          Les voyages de groupe que tu as créés restent aux autres membres : le plus ancien en
          devient l'organisateur.
        </Text>
      </View>

      <TextField
        label={`Tape ${DELETE_CONFIRMATION} pour confirmer`}
        value={typed}
        onChangeText={setTyped}
        autoCapitalize="characters"
        autoCorrect={false}
        editable={!isPending}
      />

      {error && <Notice message={error} />}

      {needsReauth ? (
        <Button
          label="Me reconnecter"
          loading={isSigningOut}
          onPress={signOut}
        />
      ) : (
        <Button
          label="Supprimer définitivement mon compte"
          icon={TrashIcon}
          loading={isPending}
          disabled={!isDeleteConfirmed(typed)}
          onPress={deleteAccount}
        />
      )}
    </View>
  );
}
