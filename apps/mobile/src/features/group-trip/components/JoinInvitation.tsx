import { router } from 'expo-router';
import { View } from 'react-native';

import { colors } from '@seego/ui';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Button, Card, LoadingState, Notice, Text } from '@/ui';
import { UsersThreeIcon } from '@/ui/icons';

import { useJoinGroupTrip } from '../hooks/useJoinGroupTrip';

/** Screen of an invite link: join right away, or sign in first (the auth modal comes back here). */
export function JoinInvitation({ code }: { code: string }) {
  const { isSignedIn, isPending } = useAuthSession();
  const { join, isJoining, error } = useJoinGroupTrip({ replace: true });

  if (isPending) return <LoadingState />;

  return (
    <View className="flex-1 justify-center">
      <Card className="items-center gap-5 p-8">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-accent">
          <UsersThreeIcon size={28} color={colors.brand} />
        </View>
        <View className="items-center gap-1.5">
          <Text variant="title" role="heading" className="text-center">
            Rejoindre un voyage
          </Text>
          <Text tone="secondary" className="text-center">
            Tu as reçu une invitation pour participer à une aventure à plusieurs.
          </Text>
        </View>

        <View className="w-full items-center gap-1 rounded-card bg-background p-3">
          <Text variant="overline">Code d’invitation</Text>
          <Text variant="section" className="tracking-[3px]">
            {code}
          </Text>
        </View>

        {error && <Notice message={error} className="w-full" />}

        <View className="w-full gap-2">
          {isSignedIn ? (
            <Button
              label="Rejoindre le voyage"
              variant="cta"
              loading={isJoining}
              onPress={() => join(code)}
            />
          ) : (
            <>
              <Button
                label="Se connecter pour rejoindre"
                variant="cta"
                onPress={() => router.push('/auth/sign-in')}
              />
              <Button
                label="Créer un compte"
                variant="outline"
                onPress={() => router.push('/auth/sign-up')}
              />
            </>
          )}
          <Button label="Plus tard" variant="ghost" size="sm" onPress={() => router.replace('/')} />
        </View>
      </Card>
    </View>
  );
}
