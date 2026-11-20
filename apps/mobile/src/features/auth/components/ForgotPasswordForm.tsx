import { useState } from 'react';
import { View } from 'react-native';

import { WEB_URL } from '@/env';
import { authClient } from '@/lib/auth-client';
import { Button, Notice, TextField } from '@/ui';

import { useAuthForm } from '../hooks/useAuthForm';
import { forgotPasswordSchema } from '../lib/validation';

/** Sends the reset link; the new password is chosen on the web page it opens. */
export function ForgotPasswordForm() {
  const [isSent, setIsSent] = useState(false);
  const form = useAuthForm({
    schema: forgotPasswordSchema,
    initialValues: { email: '' },
    request: ({ email }) =>
      authClient.requestPasswordReset({ email, redirectTo: `${WEB_URL}/reset-password` }),
    onSuccess: () => setIsSent(true),
  });

  if (isSent) {
    return (
      <Notice
        tone="success"
        message="Si un compte existe avec cette adresse, tu vas recevoir un email avec un lien pour choisir un nouveau mot de passe."
      />
    );
  }

  return (
    <View className="gap-5">
      <TextField
        label="Email"
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
        onSubmitEditing={form.submit}
      />

      {form.formError && <Notice message={form.formError} />}

      <Button
        label="Envoyer le lien"
        loading={form.isSubmitting}
        onPress={form.submit}
        className="mt-1"
      />
    </View>
  );
}
