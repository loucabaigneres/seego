import type { RouterOutputs } from '@/lib/trpc';

type EmailOutputs = RouterOutputs['admin']['email'];
export type EmailTemplate = EmailOutputs['templates']['templates'][number];
export type Broadcast = EmailOutputs['broadcasts']['broadcasts'][number];
export type ContactImport = NonNullable<EmailOutputs['overview']['lastImport']>;

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'success' | 'destructive';

/** Word typed by hand to confirm a broadcast (checked again by the API). */
export const BROADCAST_CONFIRMATION_WORD = 'ENVOYER';

export const resendTemplateUrl = (id: string) => `https://resend.com/templates/${id}`;
export const resendBroadcastUrl = (id: string) => `https://resend.com/broadcasts/${id}`;

export const TEMPLATE_STATUS: Record<
  EmailTemplate['status'],
  { label: string; variant: BadgeVariant }
> = {
  draft: { label: 'Brouillon', variant: 'secondary' },
  published: { label: 'Publié', variant: 'success' },
};

export const UNSUBSCRIBE_LINK: Record<
  NonNullable<EmailTemplate['unsubscribeLink']>,
  { label: string; variant: BadgeVariant }
> = {
  seego: { label: 'Page Seego', variant: 'success' },
  resend: { label: 'Page Resend', variant: 'outline' },
  variable: { label: 'Envoi unitaire', variant: 'secondary' },
};

export const BROADCAST_STATUS: Record<
  Broadcast['status'],
  { label: string; variant: BadgeVariant }
> = {
  draft: { label: 'Brouillon', variant: 'secondary' },
  queued: { label: 'En cours d’envoi', variant: 'outline' },
  sent: { label: 'Envoyée', variant: 'success' },
};

export const IMPORT_STATUS: Record<
  ContactImport['status'],
  { label: string; variant: BadgeVariant }
> = {
  queued: { label: 'En attente', variant: 'outline' },
  in_progress: { label: 'En cours', variant: 'outline' },
  completed: { label: 'Terminé', variant: 'success' },
  failed: { label: 'Échec', variant: 'destructive' },
};

export const isImportRunning = (status: ContactImport['status'] | undefined) =>
  status === 'queued' || status === 'in_progress';

export const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? 's' : ''}`;
