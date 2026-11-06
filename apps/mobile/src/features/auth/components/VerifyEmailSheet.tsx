import { TextInput, View } from 'react-native';

import { colors } from '@/theme/tokens';
import { Button, cn, Notice, Sheet, Spinner, Text } from '@/ui';

import type { EmailVerification } from '../hooks/useEmailVerification';
import { OTP_LENGTH } from '../lib/otp';

const BOXES = Array.from({ length: OTP_LENGTH }, (_, index) => index);

export function VerifyEmailSheet({ verification }: { verification: EmailVerification }) {
  const { code, error, info, isVerifying, cooldown } = verification;

  return (
    <Sheet visible={verification.isOpen} onClose={verification.close} title="Vérifie ton email">
      <View className="gap-5">
        <Text tone="muted">
          Entre le code à {OTP_LENGTH} chiffres envoyé à{' '}
          <Text className="font-sans-semibold">{verification.email}</Text>.
        </Text>

        <View className="flex-row gap-2">
          {BOXES.map((index) => (
            <View
              key={index}
              className={cn(
                'h-14 flex-1 items-center justify-center rounded-field border bg-surface-raised',
                error
                  ? 'border-primary-text'
                  : index === code.length
                    ? 'border-brand'
                    : 'border-line-strong',
              )}
            >
              <Text variant="section">{code[index] ?? ''}</Text>
            </View>
          ))}
          {/* One invisible input over the boxes: typing, pasting and SMS/mail autofill all land here. */}
          <TextInput
            value={code}
            onChangeText={verification.changeCode}
            editable={!isVerifying}
            autoFocus
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            maxLength={OTP_LENGTH}
            caretHidden
            selectionColor={colors.brand}
            aria-label={`Code à ${OTP_LENGTH} chiffres`}
            className="absolute inset-0 opacity-0"
          />
        </View>

        {isVerifying && <Spinner />}
        {error && <Notice message={error} />}
        {info && <Notice message={info} tone="success" />}

        <Text variant="caption">
          Pas reçu ? Regarde dans tes spams. Si tu as déjà un compte, connecte-toi.
        </Text>

        <View className="flex-row items-center justify-between">
          <Button
            label="Retour"
            variant="ghost"
            size="sm"
            className="px-0"
            onPress={verification.close}
          />
          <Button
            label={cooldown > 0 ? `Renvoyer le code (${cooldown} s)` : 'Renvoyer le code'}
            variant="ghost"
            size="sm"
            className="px-0"
            disabled={cooldown > 0 || isVerifying}
            onPress={verification.resend}
          />
        </View>
      </View>
    </Sheet>
  );
}
