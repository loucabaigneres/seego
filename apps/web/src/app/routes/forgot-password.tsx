import { createFileRoute } from '@tanstack/react-router';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/forgot-password')({
  head: () => seo({ title: 'Mot de passe oublié', path: '/forgot-password', noindex: true }),
  component: ForgotPasswordForm,
});
