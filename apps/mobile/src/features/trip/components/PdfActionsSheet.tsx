import { Pressable, View } from 'react-native';

import { colors } from '@seego/ui';
import { Sheet, Text } from '@/ui';
import { DownloadSimpleIcon, ShareNetworkIcon, type AppIcon } from '@/ui/icons';

import type { PdfAction } from '../hooks/useTripPdf';

const ACTIONS: { action: PdfAction; label: string; hint: string; icon: AppIcon }[] = [
  {
    action: 'download',
    label: 'Télécharger',
    hint: 'Enregistre-le sur ton téléphone',
    icon: DownloadSimpleIcon,
  },
  {
    action: 'share',
    label: 'Partager',
    hint: 'Envoie-le par message, mail ou Drive',
    icon: ShareNetworkIcon,
  },
];

export interface PdfActionsSheetProps {
  visible: boolean;
  onPick: (action: PdfAction) => void;
  onClose: () => void;
}

/** What to do with the itinerary's PDF. */
export function PdfActionsSheet({ visible, onPick, onClose }: PdfActionsSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Ton itinéraire en PDF">
      <View className="gap-2">
        {ACTIONS.map(({ action, label, hint, icon: Icon }) => (
          <Pressable
            key={action}
            role="button"
            onPress={() => onPick(action)}
            className="min-h-16 flex-row items-center gap-3 rounded-field bg-surface px-4 py-3 active:opacity-80"
          >
            <Icon size={24} color={colors.brand} />
            <View className="flex-1 gap-0.5">
              <Text variant="label" tone="brand">
                {label}
              </Text>
              <Text variant="caption">{hint}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}
