import { View } from 'react-native';

import { Button, GoogleLogo, Notice, Text } from '@/ui';

import { useGoogleSignIn } from '../hooks/useGoogleSignIn';

export function GoogleSignIn() {
  const google = useGoogleSignIn();

  return (
    <View className="gap-5">
      <Button
        label="Continuer avec Google"
        variant="outline"
        leading={<GoogleLogo />}
        loading={google.isPending}
        onPress={google.signIn}
      />

      {google.error && <Notice message={google.error} />}

      <View className="flex-row items-center gap-3" aria-hidden>
        <View className="h-px flex-1 bg-line" />
        <Text variant="caption">ou avec ton email</Text>
        <View className="h-px flex-1 bg-line" />
      </View>
    </View>
  );
}
