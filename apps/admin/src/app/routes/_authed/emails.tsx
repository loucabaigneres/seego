import { createFileRoute } from '@tanstack/react-router';
import { EmailsPage } from '@/features/emails/components/EmailsPage';

export const Route = createFileRoute('/_authed/emails')({
  component: EmailsPage,
});
