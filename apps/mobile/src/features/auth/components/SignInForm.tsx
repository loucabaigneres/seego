import { router } from 'expo-router';
import { useRef } from 'react';
import { View, type TextInputInstance } from 'react-native';

import { authClient } from '@/lib/auth-client';
import { Button, Notice, TextField } from '@/ui';
import { EnvelopeIcon, LockSimpleIcon } from '@/ui/icons';

import { useAuthForm } from '../hooks/useAuthForm';
import { useEmailVerification } from '../hooks/useEmailVerification';
import { finishSignIn } from '../lib/navigation';
import { signInSchema } from '../lib/validation';
import { VerifyEmailSheet } from './VerifyEmailSheet';

export function SignInForm() {
  const passwordRef = useRef<TextInputInstance>(null);
  const form = useAuthForm({
    schema: signInSchema,
    initialValues: { email: '', password: '' },
    request: (credentials) => authClient.signIn.email(credentials),
    onSuccess: finishSignIn,
    // An account whose e-mail is not confirmed yet gets a fresh code instead of an error.
    onError: async (error, credentials) => {
      if (error.code !== 'EMAIL_NOT_VERIFIED') return false;
      await authClient.emailOtp.sendVerificationOtp({
        email: credentials.email,
        type: 'email-verification',
      });
      verification.open(credentials);
      return true;
    },
  });
  const verification = useEmailVerification({ onSignInFailed: form.setFormError });

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
        returnKeyType="next"
        submitBehavior="submit"
        onSubmitEditing={() => passwordRef.current?.focus()}
      />
      <TextField
        ref={passwordRef}
        label="Mot de passe"
        icon={LockSimpleIcon}
        value={form.values.password}
        onChangeText={(value) => form.setField('password', value)}
        error={form.fieldErrors.password}
        editable={!form.isSubmitting}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={form.submit}
      />
      <Button
        label="Mot de passe oublié ?"
        variant="text"
        size="sm"
        className="-mt-3 self-end px-0"
        onPress={() => router.push('/auth/forgot-password')}
      />

      {form.formError && <Notice message={form.formError} />}

      <Button
        label="Se connecter"
        variant="cta"
        loading={form.isSubmitting}
        onPress={form.submit}
        // Pinned to the bottom of the screen when the form leaves room.
        className="mt-auto"
      />

      <VerifyEmailSheet verification={verification} />
    </View>
  );
}
