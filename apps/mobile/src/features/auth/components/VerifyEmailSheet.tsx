import { colors } from '@seego/ui';
import { TextInput, View } from 'react-native';

import { Button, cn, Notice, Sheet, Text } from '@/ui';

import type { EmailVerification } from '../hooks/useEmailVerification';
import { OTP_LENGTH } from '../lib/otp';

const BOXES = Array.from({ length: OTP_LENGTH }, (_, index) => index);

export function VerifyEmailSheet({ verification }: { verification: EmailVerification }) {
  const { code, error, info, isVerifying, cooldown } = verification;

  return (
    <Sheet visible={verification.isOpen} onClose={verification.close}>
      <View className="gap-5">
        <View className="gap-2">
          <Text variant="overline" tone="brand">
            Dernière étape
          </Text>
          <Text variant="title" role="heading">
            Vérifie ton email
          </Text>
          <Text tone="muted">
            On a envoyé un code à {OTP_LENGTH} chiffres à{' '}
            <Text className="font-sans-semibold">{verification.email}</Text>.
          </Text>
        </View>

        <View className="flex-row gap-2">
          {BOXES.map((index) => {
            const isCurrent = index === code.length;
            return (
              <View
                key={index}
                className={cn(
                  'h-16 flex-1 items-center justify-center rounded-field border',
                  error
                    ? 'border-brand bg-surface'
                    : isCurrent
                      ? 'border-brand bg-background'
                      : 'border-transparent bg-surface',
                )}
              >
                {code[index] ? (
                  <Text variant="section">{code[index]}</Text>
                ) : (
                  isCurrent && !error && <View className="h-7 w-0.5 bg-brand" />
                )}
              </View>
            );
          })}
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

        {error && <Notice message={error} />}
        {info && <Notice message={info} tone="success" />}

        <View className="flex-row flex-wrap items-center">
          <Text variant="caption">Pas reçu ? Regarde dans tes spams, ou</Text>
          <Button
            label={cooldown > 0 ? `renvoie le code dans ${cooldown} s` : 'renvoie le code'}
            variant="text"
            size="sm"
            className="px-1"
            disabled={cooldown > 0 || isVerifying}
            onPress={verification.resend}
          />
        </View>

        <Button
          label="Valider"
          loading={isVerifying}
          disabled={code.length < OTP_LENGTH}
          onPress={verification.submit}
        />
        <Button
          label="Modifier mon email"
          variant="text"
          size="sm"
          className="self-center"
          disabled={isVerifying}
          onPress={verification.close}
        />
      </View>
    </Sheet>
  );
}
