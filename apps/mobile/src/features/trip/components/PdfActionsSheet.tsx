import { Image } from 'expo-image';
import { Pressable, StyleSheet, View } from 'react-native';

import { tripDateRange, tripDisplayTitle } from '@/domain/trip-summary';
import { colors } from '@seego/ui';
import { Sheet, Text } from '@/ui';
import { FilePdfIcon, ShareNetworkIcon, type AppIcon } from '@/ui/icons';

import type { PdfAction } from '../hooks/useTripPdf';

const ACTIONS: { action: PdfAction; label: string; hint: string; icon: AppIcon }[] = [
  {
    action: 'download',
    label: 'Télécharger',
    hint: 'Enregistre-le sur ton téléphone',
    icon: FilePdfIcon,
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
  /** Printed on the page preview. */
  trip: {
    title: string | null;
    destination: string | null;
    startDate?: string | null;
    durationDays?: number | null;
  };
  coverImage: string | null;
  onPick: (action: PdfAction) => void;
  onClose: () => void;
}

/** A tilted miniature of the PDF's first page: decoration only. */
function PagePreview({ trip, coverImage }: Pick<PdfActionsSheetProps, 'trip' | 'coverImage'>) {
  return (
    <View aria-hidden className="items-center py-1.5">
      <View className="h-[196px] w-[148px] -rotate-2 gap-[7px] rounded-md border border-line bg-background p-3.5">
        {trip.destination && (
          <Text
            numberOfLines={1}
            className="font-sans text-[6px] uppercase tracking-[1px] text-ink-muted"
          >
            {trip.destination}
          </Text>
        )}
        <Text variant="section" tone="brand" numberOfLines={2} className="text-xl leading-5">
          {tripDisplayTitle(trip)}
        </Text>
        <Text className="font-sans text-[6px] text-ink-muted">{tripDateRange(trip)}</Text>
        <View className="h-[46px] overflow-hidden rounded-sm bg-ink">
          {coverImage && (
            <Image source={coverImage} style={StyleSheet.absoluteFill} contentFit="cover" />
          )}
        </View>
        <Text variant="section" className="text-[10px] leading-3">
          Jour 1
        </Text>
        {['w-[90%]', 'w-[70%]', 'w-[80%]'].map((width) => (
          <View key={width} className={`h-[5px] rounded-full bg-surface ${width}`} />
        ))}
      </View>
    </View>
  );
}

/** What to do with the itinerary's PDF. */
export function PdfActionsSheet({
  visible,
  trip,
  coverImage,
  onPick,
  onClose,
}: PdfActionsSheetProps) {
  return (
    <Sheet visible={visible} onClose={onClose} title="Ton itinéraire en PDF">
      <View className="gap-4">
        <PagePreview trip={trip} coverImage={coverImage} />
        <View className="gap-2">
          {ACTIONS.map(({ action, label, hint, icon: Icon }) => (
            <Pressable
              key={action}
              role="button"
              onPress={() => onPick(action)}
              className="min-h-[68px] flex-row items-center gap-3.5 rounded-field bg-surface px-4 py-3 active:opacity-80"
            >
              <Icon size={24} color={colors.brand} />
              <View className="flex-1">
                <Text variant="label" tone="brand">
                  {label}
                </Text>
                <Text variant="caption">{hint}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </Sheet>
  );
}
