import * as AppleAuthentication from 'expo-apple-authentication';
import { View } from 'react-native';

import { radii } from '@seego/ui';
import { Button, GoogleLogo, Notice, Text } from '@/ui';

import { useAppleSignIn } from '../hooks/useAppleSignIn';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';

/** Same height as our `md` buttons (min-h-14). */
const BUTTON_HEIGHT = 56;

export function SocialSignIn() {
  const apple = useAppleSignIn();
  const google = useGoogleSignIn();
  const isPending = apple.isPending || google.isPending;
  const error = apple.error ?? google.error;

  return (
    <View className="gap-5">
      <View className="flex-row items-center gap-3" aria-hidden>
        <View className="h-px flex-1 bg-line" />
        <Text variant="caption">ou</Text>
        <View className="h-px flex-1 bg-line" />
      </View>

      <View className="gap-3">
        {apple.isAvailable && (
          // Apple's own button, as its guidelines require. It has no loading state:
          // it fades and stops taking taps while a sign-in runs.
          <View
            pointerEvents={isPending ? 'none' : 'auto'}
            aria-busy={apple.isPending}
            className={isPending ? 'opacity-50' : undefined}
          >
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
              cornerRadius={radii.button}
              style={{ height: BUTTON_HEIGHT, width: '100%' }}
              onPress={apple.signIn}
            />
          </View>
        )}

        <Button
          label="Continuer avec Google"
          variant="outline"
          leading={<GoogleLogo />}
          loading={google.isPending}
          disabled={apple.isPending}
          onPress={google.signIn}
        />
      </View>

      {error && <Notice message={error} />}
    </View>
  );
}
