import { View } from 'react-native';

import { Button, Notice } from '@/ui';

export interface EditPlanningBarProps {
  isSaving: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onSave: () => void;
}

/** Bottom bar of the planning edit, outside the scroll so it stays in reach. */
export function EditPlanningBar({
  isSaving,
  errorMessage,
  onCancel,
  onSave,
}: EditPlanningBarProps) {
  return (
    <View className="gap-2 border-t border-line bg-background px-6 pt-3">
      {errorMessage && <Notice message={errorMessage} />}
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
