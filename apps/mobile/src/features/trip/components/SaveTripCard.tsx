import { View } from 'react-native';

import { Button, Notice } from '@/ui';
import { BookmarkSimpleIcon, LockSimpleIcon } from '@/ui/icons';

import type { useTripSave } from '../hooks/useTripSave';

export function SaveTripCard({ save }: { save: ReturnType<typeof useTripSave> }) {
  if (save.state === 'saved') {
    return <Notice tone="success" message="Sauvegardé dans ton profil" />;
  }

  const isGuest = save.state === 'sign-in';
  return (
    <View className="gap-2">
      <Button
        label={isGuest ? 'Se connecter pour enregistrer' : 'Enregistrer dans mon profil'}
        icon={isGuest ? LockSimpleIcon : BookmarkSimpleIcon}
        loading={save.isPending}
        onPress={save.run}
      />
      {isGuest && (
        <Button
          label="Pas encore de compte ? Créer un compte"
          variant="ghost"
          size="sm"
          onPress={save.signUp}
        />
      )}
      {save.failed && <Notice message="Impossible d’enregistrer ton voyage. Réessaie." />}
    </View>
  );
}
