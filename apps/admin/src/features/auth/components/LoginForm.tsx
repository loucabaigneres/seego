import { CircleAlert } from 'lucide-react';
import { type SubmitEvent, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { AdminLoginError, useAdminLogin } from '@/features/auth/hooks/useAdminLogin';

export function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAdminLogin();

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    login.mutate({ email: email.trim(), password }, { onSuccess });
  };

  const errorMessage = login.error
    ? login.error instanceof AdminLoginError
      ? login.error.message
      : 'Connexion impossible, réessaie dans un instant.'
    : null;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Seego Admin</CardTitle>
        <CardDescription>Connecte-toi avec ton compte administrateur.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            {errorMessage && (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            <Field>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Mot de passe</FieldLabel>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Field>
              <Button type="submit" disabled={login.isPending}>
                {login.isPending && <Spinner data-icon="inline-start" />}
                Se connecter
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
