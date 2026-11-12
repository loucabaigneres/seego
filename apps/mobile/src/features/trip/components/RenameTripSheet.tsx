import { View } from 'react-native';

import { Button, Sheet, TextField } from '@/ui';

import type { useTripRename } from '../hooks/useTripRename';
import { TRIP_TITLE_MAX_LENGTH } from '../lib/trip-title';

export function RenameTripSheet({ rename }: { rename: ReturnType<typeof useTripRename> }) {
  return (
    <Sheet visible={rename.isOpen} onClose={rename.close} title="Renommer ton voyage">
      <View className="gap-4">
        <TextField
          label="Titre du voyage"
          value={rename.value}
          onChangeText={rename.setValue}
          error={rename.error ?? undefined}
          editable={!rename.isSaving}
          maxLength={TRIP_TITLE_MAX_LENGTH}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={rename.save}
        />
        <Button
          label="Enregistrer"
          loading={rename.isSaving}
          disabled={!rename.canSave}
          onPress={rename.save}
        />
      </View>
    </Sheet>
  );
}
