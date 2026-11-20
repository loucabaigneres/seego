import { View } from 'react-native';

import { Button, Notice, Text } from '@/ui';

export interface EditPlanningBarProps {
  isSaving: boolean;
  isDirty: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onSave: () => void;
}

/** Bottom bar of the planning edit, outside the scroll so it stays in reach. */
export function EditPlanningBar({
  isSaving,
  isDirty,
  errorMessage,
  onCancel,
  onSave,
}: EditPlanningBarProps) {
  return (
    <View className="gap-2.5 border-t border-line bg-background px-6 pt-3.5">
      {errorMessage && <Notice message={errorMessage} />}
      {isDirty && (
        <Text variant="caption" className="text-center">
          Modifications non enregistrées
        </Text>
      )}
      <View className="flex-row gap-2">
        <Button
          label="Annuler"
          variant="outline"
          disabled={isSaving}
          onPress={onCancel}
          className="flex-1"
        />
        <Button
          // Same label while saving: the spinner says it, and a longer label wraps on half a row.
          label="Enregistrer"
          loading={isSaving}
          onPress={onSave}
          className="flex-1"
        />
      </View>
    </View>
  );
}
