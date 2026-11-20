import { Image } from 'expo-image';
import { View } from 'react-native';

import { formatMonthYear } from '@/domain/date';
import type { RouterOutputs } from '@/lib/trpc';
import { Text } from '@/ui';

import { avatarInitial } from '../lib/profile';

type ProfileUser = NonNullable<RouterOutputs['user']['getProfile']['user']>;

const AVATAR_SIZE = 76;

export function ProfileHeader({ user }: { user: ProfileUser }) {
  const since = formatMonthYear(user.createdAt);

  return (
    <View className="flex-row items-center gap-4">
      {user.image ? (
        <Image
          source={user.image}
          accessibilityIgnoresInvertColors
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2 }}
          contentFit="cover"
          transition={150}
        />
      ) : (
        <View
          aria-hidden
          className="items-center justify-center rounded-full bg-brand"
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
        >
          <Text variant="title" tone="accent">
            {avatarInitial(user.name, user.email)}
          </Text>
        </View>
      )}

      <View className="flex-1">
        <Text variant="section" role="heading" numberOfLines={1} className="text-[32px] leading-[34px]">
          {user.name || 'Voyageur'}
        </Text>
        <Text tone="muted" numberOfLines={1} className="text-[15px]">
          {user.email}
        </Text>
        {since && <Text variant="caption">Membre depuis {since}</Text>}
      </View>
    </View>
  );
}
