import { createFileRoute } from '@tanstack/react-router';
import { PrivacyPolicy } from '@/features/legal/components/PrivacyPolicy';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/confidentialite')({
  head: () => seo({ title: 'Politique de confidentialité', path: '/confidentialite' }),
  component: PrivacyPolicy,
});
