import { AudienceCard } from '@/features/emails/components/AudienceCard';
import { BroadcastsCard } from '@/features/emails/components/BroadcastsCard';
import { TemplatesCard } from '@/features/emails/components/TemplatesCard';
import { useAudience } from '@/features/emails/hooks/useAudience';

/** Newsletter back-office: Resend audience, templates and campaigns. */
export function EmailsPage() {
  const { overview } = useAudience();
  const campaignsEnabled = overview.data?.syncEnabled ?? false;
  const recipients = overview.data?.audience?.subscribed ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="type-section">Emails</h1>
        <p className="text-sm text-muted-foreground">Newsletter et campagnes envoyées via Resend</p>
      </div>
      <AudienceCard />
      <TemplatesCard campaignsEnabled={campaignsEnabled} />
      <BroadcastsCard campaignsEnabled={campaignsEnabled} recipients={recipients} />
    </div>
  );
}
