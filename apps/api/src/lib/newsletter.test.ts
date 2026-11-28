import { describe, expect, it, vi } from 'vitest';

vi.mock('../env.js', () => ({ env: { RESEND_API_KEY: 're_test' } }));
vi.mock('./email.js', () => ({ resend: {} }));
vi.mock('./tables.js', () => ({ waitlistLeads: {} }));
vi.mock('./unsubscribe.js', () => ({ buildUnsubscribeUrl: vi.fn() }));

const { buildContactsCsv, isNewsletterSyncEnabled, ResendApiError, resendCall } =
  await import('./newsletter.js');

describe('buildContactsCsv', () => {
  it('writes one quoted row per lead with its opt-out state and unsubscribe link', () => {
    expect(
      buildContactsCsv(
        [
          { email: 'a@seego.fr', unsubscribedAt: null },
          { email: 'b"x@seego.fr', unsubscribedAt: new Date() },
        ],
        (email) => `https://api.seego.fr/unsubscribe?token=${email.length}`,
      ),
    ).toBe(
      'email,unsubscribed,unsubscribe_url\n' +
        '"a@seego.fr",false,"https://api.seego.fr/unsubscribe?token=10"\n' +
        '"b""x@seego.fr",true,"https://api.seego.fr/unsubscribe?token=12"',
    );
  });
});

describe('resendCall', () => {
  it('returns the data of a successful call', async () => {
    await expect(resendCall(async () => ({ data: { id: '1' }, error: null }))).resolves.toEqual({
      id: '1',
    });
  });

  it('throws a ResendApiError carrying the Resend error name', async () => {
    const call = resendCall(async () => ({
      data: null,
      error: { name: 'not_found', message: 'Contact not found' },
    }));
    await expect(call).rejects.toBeInstanceOf(ResendApiError);
    await expect(call).rejects.toMatchObject({ code: 'not_found' });
  });

  it('retries when rate-limited', async () => {
    vi.useFakeTimers();
    const fn = vi
      .fn()
      .mockResolvedValueOnce({ data: null, error: { name: 'rate_limit_exceeded', message: '' } })
      .mockResolvedValueOnce({ data: 'ok', error: null });
    const result = resendCall(fn);
    await vi.runAllTimersAsync();
    await expect(result).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});

describe('sync guard', () => {
  it('stays off without a waitlist segment (staging, local)', () => {
    expect(isNewsletterSyncEnabled()).toBe(false);
  });
});
