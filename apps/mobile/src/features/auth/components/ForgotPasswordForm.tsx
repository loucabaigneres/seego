import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { WEB_URL } from '@/env';
import { authClient } from '@/lib/auth-client';
import { Button, Notice, TextField } from '@/ui';
import { EnvelopeIcon } from '@/ui/icons';

import { useAuthForm } from '../hooks/useAuthForm';
import { useCooldown } from '../hooks/useCooldown';
import { forgotPasswordSchema } from '../lib/validation';

const RESEND_DELAY_S = 30;

/** Sends the reset link; the new password is chosen on the web page it opens. */
export function ForgotPasswordForm() {
  const [isSent, setIsSent] = useState(false);
  const cooldown = useCooldown(RESEND_DELAY_S);
  const form = useAuthForm({
    schema: forgotPasswordSchema,
    initialValues: { email: '' },
    request: ({ email }) =>
      authClient.requestPasswordReset({ email, redirectTo: `${WEB_URL}/reset-password` }),
    onSuccess: () => {
      setIsSent(true);
      cooldown.start();
    },
  });

  // The keyboard's send key must wait for the cooldown too, not only the button.
  const send = () => {
    if (cooldown.seconds === 0) void form.submit();
  };

  const submitLabel = !isSent
    ? 'Envoyer le lien'
    : cooldown.seconds > 0
      ? `Renvoyer le lien · ${cooldown.seconds} s`
      : 'Renvoyer le lien';

  return (
    <View className="flex-1 gap-5">
      <TextField
        label="Email"
        icon={EnvelopeIcon}
        placeholder="lea@exemple.fr"
        value={form.values.email}
        onChangeText={(value) => form.setField('email', value)}
        error={form.fieldErrors.email}
        editable={!form.isSubmitting}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        returnKeyType="send"
        onSubmitEditing={send}
      />

      {form.formError && <Notice message={form.formError} />}
      {isSent && !form.formError && (
        <Notice
          tone="success"
          message="Si un compte existe avec cette adresse, tu vas recevoir un email avec un lien pour choisir un nouveau mot de passe."
        />
      )}

      <View className="mt-auto gap-1.5">
        <Button
          label={submitLabel}
          variant="cta"
          loading={form.isSubmitting}
          disabled={cooldown.seconds > 0}
          onPress={send}
        />
        <Button
          label="Revenir à la connexion"
          variant="text"
          size="sm"
          onPress={() => router.dismissTo('/auth/sign-in')}
        />
      </View>
    </View>
  );
}
