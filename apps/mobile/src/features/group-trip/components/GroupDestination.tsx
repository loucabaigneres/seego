import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { isDestinationPending } from '@/domain/group';
import { tripDisplayTitle } from '@/domain/trip-summary';
import { colors } from '@seego/ui';
import { AvatarStack, Button, IconButton, Notice, Text, TextField } from '@/ui';
import { ArrowLeftIcon, CaretRightIcon, CompassIcon, MapPinIcon, UsersThreeIcon } from '@/ui/icons';

import type { useGroupTrip } from '../hooks/useGroupTrip';

export interface GroupDestinationProps {
  trip: { title: string | null; destination: string | null };
  group: ReturnType<typeof useGroupTrip>;
}

/**
 * A group trip with no city yet: the group types one, or the organizer finds it with the quiz
 * (`/onboarding` reuses the organizer's pending group trip, see `discovery.ts`).
 */
export function GroupDestination({ trip, group }: GroupDestinationProps) {
  const { destination, members } = group;
  // The trip holds a placeholder ("Destination à définir") until a city is saved.
  const city = isDestinationPending(destination.value) ? '' : destination.value.trim();
  const count = members.list.length;
  const save = () => destination.canSave && city && destination.save();

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-brand">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="flex-row justify-between px-3.5 pt-2">
          <IconButton
            label="Retour"
            variant="scrim"
            icon={ArrowLeftIcon}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/trips'))}
          />
          <IconButton
            label="Participants"
            variant="scrim"
            icon={UsersThreeIcon}
            onPress={group.openParticipants}
          />
        </View>

        <View className="gap-3 px-6 pb-8 pt-4">
          <Text variant="overline" tone="accent">
            Voyage de groupe · destination à définir
          </Text>
          <Text
            variant="title"
            tone="inverse"
            role="heading"
            className="text-[42px] leading-[44px]"
          >
            {tripDisplayTitle({ title: trip.title })}
          </Text>
          <Pressable
            role="button"
            aria-label={
              group.isHost ? `${count} participants, inviter des amis` : `${count} participants`
            }
            onPress={group.openParticipants}
            className="flex-row items-center gap-2.5 self-start py-1 active:opacity-80"
          >
            {count > 0 && (
              <AvatarStack
                names={members.list.slice(0, 3).map((m) => m.name || m.email)}
                extra={Math.max(count - 3, 0)}
                size="md"
                ringClassName="border-brand"
              />
            )}
            <Text variant="caption" tone="inverse" className="text-[14px]">
              {count > 1 ? `${count} participants` : 'Rien que toi pour l’instant'}
              {group.isHost && <Text className="font-sans-semibold text-accent"> · Inviter</Text>}
            </Text>
          </Pressable>
        </View>

        <SafeAreaView
          edges={['bottom']}
          className="flex-1 overflow-hidden rounded-t-[28px] bg-background"
        >
          <ScrollView
            className="flex-1"
            contentContainerClassName="grow gap-4 px-6 pb-6 pt-7"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="gap-1">
              <Text variant="title" role="heading" className="text-[30px] leading-[34px]">
                Où part le groupe ?
              </Text>
              <Text variant="caption" className="text-[14px] leading-5">
                {group.isHost
                  ? 'Choisis la ville toi-même, ou laisse le quiz trancher.'
                  : 'Propose une ville : tout le groupe la verra.'}
              </Text>
            </View>

            <TextField
              label="Destination"
              placeholder="Ex. Lisbonne"
              icon={MapPinIcon}
              value={city}
              onChangeText={destination.setValue}
              editable={!destination.isSaving}
              returnKeyType="go"
              onSubmitEditing={save}
            />

            {group.isHost && (
              <>
                <View aria-hidden className="flex-row items-center gap-3">
                  <View className="h-px flex-1 bg-line" />
                  <Text variant="caption">ou</Text>
                  <View className="h-px flex-1 bg-line" />
                </View>
                <Pressable
                  role="link"
                  aria-label="Trouver avec le quiz : 4 questions, puis on swipe des lieux"
                  onPress={() => router.push('/onboarding')}
                  className="flex-row items-center gap-3.5 rounded-field bg-surface px-4 py-3.5 active:opacity-80"
                >
                  <View className="size-10 items-center justify-center rounded-xl bg-background">
                    <CompassIcon size={20} color={colors.brand} />
                  </View>
                  <View className="flex-1">
                    <Text variant="label" className="text-[15px] leading-5">
                      Trouver avec le quiz
                    </Text>
                    <Text variant="caption">4 questions, puis on swipe des lieux</Text>
                  </View>
                  <CaretRightIcon size={20} color={colors.brand} />
                </Pressable>
              </>
            )}

            <View className="mt-auto gap-2.5 pt-4">
              {group.error && <Notice message={group.error} />}
              <Button
                label={city ? `Valider ${city}` : 'Valider la destination'}
                variant="cta"
                loading={destination.isSaving}
                disabled={!city || !destination.canSave}
                onPress={save}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
