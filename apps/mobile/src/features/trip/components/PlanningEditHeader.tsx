import { Text } from '@/ui';
import { PencilSimpleIcon } from '@/ui/icons';

import { PillButton } from './PillButton';

/** "Modifier le planning" above the timeline; the edit's instructions once it started. */
export function PlanningEditHeader({
  isEditing,
  onStart,
}: {
  isEditing: boolean;
  onStart: () => void;
}) {
  return isEditing ? (
    <Text variant="caption" tone="secondary" className="rounded-field bg-surface px-4 py-3">
      Réordonne, déplace ou supprime des lieux, puis enregistre. L’hébergement est commun à tout le
      séjour : utilise « Changer » hors édition pour le remplacer.
    </Text>
  ) : (
    <PillButton label="Modifier le planning" icon={PencilSimpleIcon} onPress={onStart} />
  );
}
