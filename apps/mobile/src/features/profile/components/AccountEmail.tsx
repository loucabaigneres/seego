import { View } from 'react-native';

import { colors } from '@seego/ui';
import { Text } from '@/ui';
import { EnvelopeIcon, LockSimpleIcon } from '@/ui/icons';

/** The sign-in email, read-only: the lock says it can't be changed here. */
export function AccountEmail({ email }: { email: string | undefined }) {
  if (!email) return null;
  return (
    <View className="flex-row items-center gap-3 border-y border-line py-4">
      <EnvelopeIcon size={20} color={colors.brand} />
      <View className="flex-1">
        <Text variant="label" className="text-control">
          Email
        </Text>
        <Text variant="caption" numberOfLines={1}>
          {email}
        </Text>
      </View>
      <LockSimpleIcon size={20} color={colors.ink.muted} />
    </View>
  );
}
