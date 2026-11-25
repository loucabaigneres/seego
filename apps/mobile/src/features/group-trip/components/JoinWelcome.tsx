import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AvatarStack, Button, Skeleton, Text } from '@/ui';
import { ArrowRightIcon } from '@/ui/icons';

import { useJoinWelcome } from '../hooks/useJoinWelcome';

/** Tilted print of the trip: its photo, else a dark frame, with the city written under it. */
function Polaroid({ image, caption }: { image: string | null; caption: string | null }) {
  return (
    <View aria-hidden className="w-[222px] rotate-3 self-center rounded-md bg-background p-2.5">
      <View className="h-[188px] overflow-hidden bg-ink">
        {image && <Image source={image} style={StyleSheet.absoluteFill} contentFit="cover" />}
      </View>
      <Text
        variant="title"
        tone="brand"
        numberOfLines={1}
        className="px-1 pt-2.5 text-[30px] leading-8"
      >
        {caption ?? ' '}
      </Text>
    </View>
  );
}

/**
 * Right after joining: who is in, and where the trip will be found. Whatever fails to load, the
 * title and the way to the trip stay, so a member who just joined is never stuck here.
 */
export function JoinWelcome({ tripId }: { tripId: string }) {
  const welcome = useJoinWelcome(tripId);
  const { isLoading, failed } = welcome;
  const ready = !isLoading && !failed;

  return (
    <SafeAreaView className="flex-1 bg-brand px-6">
      <StatusBar style="light" />
      <View className="flex-1 justify-center gap-8">
        {isLoading ? (
          <Skeleton className="h-[258px] w-[222px] self-center rounded-md" />
        ) : (
          ready && (
            <View>
              <Polaroid image={welcome.coverImage} caption={welcome.destination} />
              {welcome.memberNames.length > 0 && (
                <View className="-mt-6 items-center">
                  <AvatarStack names={welcome.memberNames} size="md" ringClassName="border-brand" />
                </View>
              )}
            </View>
          )
        )}

        <View className="items-center gap-3">
          {ready && welcome.title && (
            <Text variant="overline" tone="accent" className="text-center">
              {welcome.title}
            </Text>
          )}
          <Text
            variant="title"
            tone="inverse"
            role="heading"
            className="text-center text-[46px] leading-[48px]"
          >
            Tu fais partie du voyage.
          </Text>
          <Text tone="inverse" className="max-w-[300px] text-center opacity-80">
            {ready && welcome.waiting ? `${welcome.waiting} ` : ''}Tu retrouves ce voyage dans
            Voyages, onglet Groupés.
          </Text>
          {failed && (
            <Button
              label="Réessayer d’afficher le voyage"
              variant="onBrandSoft"
              size="sm"
              onPress={() => void welcome.retry()}
            />
          )}
        </View>
      </View>

      <View className="gap-1.5 pb-2">
        <Button
          label="Voir le voyage"
          variant="onBrand"
          icon={ArrowRightIcon}
          onPress={() => router.replace({ pathname: '/trip/[tripId]', params: { tripId } })}
        />
        <Pressable
          role="button"
          onPress={() => router.replace('/trips')}
          className="min-h-11 items-center justify-center active:opacity-80"
        >
          <Text variant="label" tone="accent" className="text-[15px]">
            Plus tard
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
