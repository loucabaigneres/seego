import { createFileRoute } from '@tanstack/react-router';
import { WaitlistTable } from '@/features/waitlist/components/WaitlistTable';

export const Route = createFileRoute('/_authed/waitlist')({
  component: WaitlistTable,
});
