import { createFileRoute } from '@tanstack/react-router';
import { LegalNotice } from '@/features/legal/components/LegalNotice';
import { seo } from '@/lib/seo';

export const Route = createFileRoute('/mentions-legales')({
  head: () => seo({ title: 'Mentions légales', path: '/mentions-legales' }),
  component: LegalNotice,
});
