import { View } from 'react-native';

import { Notice, Text } from '@/ui';
import { FilePdfIcon, PencilSimpleIcon } from '@/ui/icons';

import { PillButton } from './PillButton';

export interface PlanningEditHeaderProps {
  isEditing: boolean;
  onStart: () => void;
  pdf: {
    choose: () => void;
    isExporting: boolean;
    savedMessage: string | null;
    errorMessage: string | null;
  };
}

/** "Modifier le planning" and the PDF export above the timeline; the edit's instructions once it started. */
export function PlanningEditHeader({ isEditing, onStart, pdf }: PlanningEditHeaderProps) {
  return isEditing ? (
    <Text variant="caption" tone="secondary" className="rounded-field bg-surface px-4 py-3">
      Réordonne, déplace ou supprime des lieux, puis enregistre. L’hébergement est commun à tout le
      séjour : utilise « Changer » hors édition pour le remplacer.
    </Text>
  ) : (
    <View className="gap-2">
      <View className="flex-row gap-2">
        <PillButton label="Modifier le planning" icon={PencilSimpleIcon} onPress={onStart} />
        <PillButton label="PDF" icon={FilePdfIcon} onPress={pdf.choose} loading={pdf.isExporting} />
      </View>
      {pdf.errorMessage && <Notice message={pdf.errorMessage} />}
      {pdf.savedMessage && <Notice tone="success" message={pdf.savedMessage} />}
    </View>
  );
}
