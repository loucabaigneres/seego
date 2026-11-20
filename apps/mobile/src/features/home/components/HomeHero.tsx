import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { colors } from '@seego/ui';
import { Text, Wordmark } from '@/ui';
import { UserIcon } from '@/ui/icons';

export interface HomeHeroProps {
  /** Signed-in user's name, for the profile disc; a guest gets an icon. */
  userName?: string | null;
}

export function HomeHero({ userName }: HomeHeroProps) {
  const initial = userName?.trim().charAt(0).toUpperCase();

  return (
    <View className="gap-6">
      <View className="h-10 flex-row items-center justify-between">
        <Wordmark className="text-[30px] leading-9" />
        <Pressable
          role="link"
          aria-label="Mon profil"
          hitSlop={4}
          onPress={() => router.push('/profile')}
          className="size-10 items-center justify-center rounded-full bg-brand active:opacity-80"
        >
          {initial ? (
            <Text variant="body" tone="accent" className="font-sans-semibold">
              {initial}
            </Text>
          ) : (
            <UserIcon size={20} color={colors.accent} />
          )}
        </Pressable>
      </View>

      <View className="gap-2.5 pt-1">
        <Text variant="overline">Ton voyage commence ici</Text>
        <Text role="heading" className="font-display text-[42px] leading-[44px] text-ink">
          {'On part où,\ncette fois ?'}
        </Text>
      </View>
    </View>
  );
}
