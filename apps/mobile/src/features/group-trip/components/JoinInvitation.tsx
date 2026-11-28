import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors } from '@seego/ui';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Button, IconButton, LoadingState, Notice, Tag, Text } from '@/ui';
import { UsersThreeIcon, XIcon } from '@/ui/icons';

import { useJoinGroupTrip } from '../hooks/useJoinGroupTrip';

/**
 * An invitation, from a link or a typed code: join right away, or sign in first (the auth modal
 * comes back here). The trip itself stays hidden until joined: only members may see it.
 */
export function JoinInvitation({ code }: { code: string }) {
  const { isSignedIn, isPending } = useAuthSession();
  const { join, isJoining, failed } = useJoinGroupTrip();

  if (isPending) return <LoadingState />;

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-brand">
      <StatusBar style="light" />
      <View className="flex-row justify-end px-4 pt-2">
        <IconButton
          label="Fermer"
          variant="scrim"
          icon={XIcon}
          onPress={() => router.replace('/')}
        />
      </View>
      <View aria-hidden className="flex-1 items-center justify-center pb-10">
        <UsersThreeIcon size={96} color={colors.accent} weight="light" />
      </View>

      <SafeAreaView
        edges={['bottom']}
        className="-mt-8 gap-4 rounded-t-[28px] bg-background px-6 pb-2 pt-6"
      >
        <View className="gap-1">
          <Text variant="overline" tone="brand">
            Voyage de groupe
          </Text>
          <Text variant="title" role="heading" className="text-[40px] leading-[42px]">
            Rejoindre un voyage
          </Text>
        </View>
        <View className="flex-row flex-wrap gap-1.5">
          <Tag label={`Code ${code}`} capitalize={false} />
          <Tag label="Valable 24 h" capitalize={false} />
        </View>
        <Text tone="muted">
          Rejoins le groupe pour voir l’itinéraire et préparer le voyage ensemble.
        </Text>

        {failed && (
          <Notice message="Impossible de rejoindre le voyage pour le moment. Réessaie." />
        )}

        <View className="mt-4 gap-1.5">
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
          <Button
            label="Plus tard"
            variant="text"
            size="sm"
            disabled={isJoining}
            onPress={() => router.replace('/')}
          />
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
}
