import { waitlistLeads } from '@seego/database';
import { TRPCError } from '@trpc/server';
import { count, isNotNull } from 'drizzle-orm';
import { FROM_MARKETING, resend } from '../../../lib/email.js';
import {
  isNewsletterSyncEnabled,
  listResendContacts,
  newsletterSegmentId,
  ResendApiError,
  resendCall,
  syncWaitlistToResend,
  UNSUBSCRIBE_URL_PROPERTY,
} from '../../../lib/newsletter.js';
import { adminProcedure, createTRPCRouter } from '../../init.js';
import {
  createBroadcastSchema,
  emailTemplateSchema,
  removeBroadcastSchema,
  sendBroadcastSchema,
} from '../../schemas/admin.js';

/**
 * Which unsubscribe link a template carries:
 * - `seego`: `{{{contact.unsubscribe_url}}}`, our branded /unsubscribe page (preferred);
 * - `resend`: `{{{RESEND_UNSUBSCRIBE_URL}}}`, Resend's hosted page (synced back by the webhook);
 * - `variable`: `{{{UNSUBSCRIBE_URL}}}`, filled by the API in transactional sends only.
 */
function unsubscribeLinkKind(html: string) {
  if (html.includes(`contact.${UNSUBSCRIBE_URL_PROPERTY}`)) return 'seego' as const;
  if (html.includes('RESEND_UNSUBSCRIBE_URL')) return 'resend' as const;
  if (html.includes('{{{UNSUBSCRIBE_URL')) return 'variable' as const;
  return null;
}

/** Runs a Resend call and turns its failure into a tRPC error with a readable message. */
async function viaResend<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof TRPCError) throw err;
    if (err instanceof ResendApiError) {
      if (err.code === 'restricted_api_key') {
        throw new TRPCError({
          code: 'PRECONDITION_FAILED',
          message:
            'La clé RESEND_API_KEY de l’API n’a que l’accès « Sending » : il faut une clé « Full access » pour lire les contacts, templates et campagnes.',
          cause: err,
        });
      }
      throw new TRPCError({
        code: err.code === 'not_found' ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR',
        message: `Resend : ${err.message}`,
        cause: err,
      });
    }
    throw err;
  }
}

function requireSegment() {
  if (!newsletterSegmentId) {
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'Campagnes désactivées sur cet environnement (RESEND_WAITLIST_SEGMENT_ID absent).',
    });
  }
  return newsletterSegmentId;
}

/**
 * A template can become a broadcast when it needs no variable of ours (a broadcast only fills
 * Resend's reserved ones and contact properties) and carries an unsubscribe link, mandatory
 * for any newsletter.
 */
function broadcastReadiness(template: {
  status: string;
  subject: string | null;
  html: string;
  variables: { key: string }[] | null;
}) {
  const issues: string[] = [];
  if (template.status !== 'published') issues.push('Template non publié');
  if (!template.subject) issues.push('Pas d’objet');
  const link = unsubscribeLinkKind(template.html);
  if (link !== 'seego' && link !== 'resend') {
    issues.push('Pas de lien de désinscription {{{contact.unsubscribe_url}}}');
  }
  if ((template.variables ?? []).length > 0) issues.push('Utilise des variables personnalisées');
  return issues;
}

/** `admin.email.*`: newsletter audience, templates and broadcasts on Resend. */
export const emailAdminRouter = createTRPCRouter({
  /** Audience counts on both sides and the state of the last contact import. */
  overview: adminProcedure.query(async ({ ctx }) => {
    const [[{ total }], [{ unsubscribed }]] = await Promise.all([
      ctx.db.select({ total: count() }).from(waitlistLeads),
      ctx.db
        .select({ unsubscribed: count() })
        .from(waitlistLeads)
        .where(isNotNull(waitlistLeads.unsubscribedAt)),
    ]);
    const leads = { total, subscribed: total - unsubscribed, unsubscribed };

    if (!isNewsletterSyncEnabled() || !newsletterSegmentId) {
      return { syncEnabled: false as const, leads, audience: null, lastImport: null };
    }
    const segmentId = newsletterSegmentId;

    return viaResend(async () => {
      const { contacts, truncated } = await listResendContacts(segmentId);
      const imports = await resendCall(() => resend.contacts.imports.list({ limit: 1 }));
      const last = imports.data[0];
      const audienceUnsubscribed = contacts.filter((c) => c.unsubscribed).length;
      return {
        syncEnabled: true as const,
        leads,
        audience: {
          segmentId,
          total: contacts.length,
          subscribed: contacts.length - audienceUnsubscribed,
          unsubscribed: audienceUnsubscribed,
          truncated,
        },
        lastImport: last
          ? {
              id: last.id,
              status: last.status,
              createdAt: last.created_at,
              completedAt: last.completed_at,
              counts: last.counts,
            }
          : null,
      };
    });
  }),

  /** Pushes every waitlist lead (with its opt-out state) to the Resend segment. */
  sync: adminProcedure.mutation(async ({ ctx }) => {
    requireSegment();
    return viaResend(() => syncWaitlistToResend(ctx.db));
  }),

  /** Resend templates, with whether each can be turned into a broadcast. */
  templates: adminProcedure.query(() =>
    viaResend(async () => {
      const list = await resendCall(() => resend.templates.list({ limit: 100 }));
      const templates = [];
      // One by one: the list has no HTML, and Resend rate-limits parallel calls.
      for (const item of list.data) {
        const template = await resendCall(() => resend.templates.get(item.id));
        const broadcastIssues = broadcastReadiness(template);
        templates.push({
          id: template.id,
          name: template.name,
          alias: template.alias,
          status: template.status,
          subject: template.subject,
          from: template.from,
          updatedAt: template.updated_at,
          hasUnpublishedVersions: template.has_unpublished_versions,
          variables: (template.variables ?? []).map((v) => v.key),
          unsubscribeLink: unsubscribeLinkKind(template.html),
          broadcastIssues,
        });
      }
      return { templates };
    }),
  ),

  /** Broadcasts of the account, newest first. */
  broadcasts: adminProcedure.query(() =>
    viaResend(async () => {
      const list = await resendCall(() => resend.broadcasts.list({ limit: 100 }));
      return {
        broadcasts: list.data.map((b) => ({
          id: b.id,
          name: b.name,
          status: b.status,
          segmentId: b.segment_id,
          createdAt: b.created_at,
          scheduledAt: b.scheduled_at,
          sentAt: b.sent_at,
          targetsWaitlist: b.segment_id !== null && b.segment_id === newsletterSegmentId,
        })),
      };
    }),
  ),

  /** Creates a draft broadcast to the waitlist segment from a published template. Sends nothing. */
  createBroadcast: adminProcedure.input(createBroadcastSchema).mutation(({ input }) => {
    const segmentId = requireSegment();
    return viaResend(async () => {
      const template = await resendCall(() => resend.templates.get(input.templateId));
      const issues = broadcastReadiness(template);
      if (issues.length > 0) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Template inutilisable pour une campagne : ${issues.join(', ')}.`,
        });
      }
      const created = await resendCall(() =>
        resend.broadcasts.create({
          name: input.name,
          segmentId,
          from: FROM_MARKETING,
          subject: template.subject ?? '',
          html: template.html,
          ...(template.text ? { text: template.text } : {}),
          send: false,
        }),
      );
      return { id: created.id };
    });
  }),

  /**
   * Sends a draft broadcast to the whole waitlist segment, right away. Guarded by a confirmation
   * word typed by hand; only drafts targeting the waitlist segment can go out from here.
   */
  sendBroadcast: adminProcedure.input(sendBroadcastSchema).mutation(({ input }) => {
    const segmentId = requireSegment();
    return viaResend(async () => {
      const broadcast = await resendCall(() => resend.broadcasts.get(input.broadcastId));
      if (broadcast.status !== 'draft') {
        throw new TRPCError({ code: 'CONFLICT', message: 'Cette campagne a déjà été envoyée.' });
      }
      if (broadcast.segment_id !== segmentId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cette campagne ne cible pas le segment Waitlist.',
        });
      }
      const sent = await resendCall(() => resend.broadcasts.send(broadcast.id));
      return { id: sent.id };
    });
  }),

  /** Deletes a draft broadcast (Resend refuses to delete sent ones). */
  removeBroadcast: adminProcedure.input(removeBroadcastSchema).mutation(({ input }) =>
    viaResend(async () => {
      const broadcast = await resendCall(() => resend.broadcasts.get(input.broadcastId));
      if (broadcast.status !== 'draft') {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Seuls les brouillons peuvent être supprimés.',
        });
      }
      await resendCall(() => resend.broadcasts.remove(broadcast.id));
      return { id: broadcast.id };
    }),
  ),

  /**
   * Sends one template to the signed-in admin only, to check its rendering. Variables take their
   * fallback values; Resend's unsubscribe placeholder is only filled in real broadcasts.
   */
  sendTest: adminProcedure.input(emailTemplateSchema).mutation(({ ctx, input }) =>
    viaResend(async () => {
      const template = await resendCall(() => resend.templates.get(input.templateId));
      if (template.status !== 'published') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Publie le template sur Resend avant de l’envoyer en test.',
        });
      }
      const sent = await resendCall(() =>
        resend.emails.send({
          from: template.from ?? FROM_MARKETING,
          to: ctx.user.email,
          subject: `[Test] ${template.subject ?? template.name}`,
          template: { id: template.id },
        }),
      );
      return { id: sent.id, to: ctx.user.email };
    }),
  ),
});
