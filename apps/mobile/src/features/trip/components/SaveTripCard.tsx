import { View } from 'react-native';

import { Button, Notice } from '@/ui';
import { BookmarkSimpleIcon, LockSimpleIcon } from '@/ui/icons';

import type { useTripSave } from '../hooks/useTripSave';

export function SaveTripCard({ save }: { save: ReturnType<typeof useTripSave> }) {
  // Once saved, the "Finalisé" badge says it: the notice only confirms the save just made.
  if (save.state === 'saved') {
    return save.justSaved ? (
      <Notice tone="success" message="C’est enregistré, retrouve-le dans l’onglet Voyages." />
    ) : null;
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
