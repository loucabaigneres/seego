import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
  extractEmailsFromSubmissionsPage,
  extractTallyEmail,
  normalizeEmail,
  verifyTallySignature,
} from './tallyLeads.js';

describe('normalizeEmail', () => {
  it('trims and lower-cases a valid address', () => {
    expect(normalizeEmail('  Alice@Example.COM ')).toBe('alice@example.com');
  });

  it('rejects anything that is not an e-mail address', () => {
    expect(normalizeEmail('')).toBeNull();
    expect(normalizeEmail('pas un mail')).toBeNull();
    expect(normalizeEmail(['a@b.fr'])).toBeNull();
    expect(normalizeEmail(undefined)).toBeNull();
  });
});

describe('extractTallyEmail', () => {
  it('returns the answer of the INPUT_EMAIL field', () => {
    expect(
      extractTallyEmail([
        { type: 'MULTIPLE_CHOICE', value: ['x'] },
        { type: 'INPUT_EMAIL', value: 'Bob@Seego.fr' },
      ]),
    ).toBe('bob@seego.fr');
  });

  it('returns null when the e-mail question was left empty', () => {
    expect(extractTallyEmail([{ type: 'INPUT_EMAIL', value: null }])).toBeNull();
    expect(extractTallyEmail([{ type: 'CHECKBOXES', value: ['J’accepte'] }])).toBeNull();
  });
});

describe('extractEmailsFromSubmissionsPage', () => {
  it('keeps the submissions that left an e-mail, with their date', () => {
    const result = extractEmailsFromSubmissionsPage({
      hasMore: false,
      questions: [
        { id: 'age', type: 'MULTIPLE_CHOICE' },
        { id: 'mail', type: 'INPUT_EMAIL' },
      ],
      submissions: [
        {
          id: 's1',
          submittedAt: '2026-11-16T13:53:55.000Z',
          responses: [
            { questionId: 'age', answer: ['18 – 24 ans'] },
            { questionId: 'mail', answer: ' Sasa@Gmail.com' },
          ],
        },
        { id: 's2', submittedAt: '2026-11-11T17:28:24.000Z', responses: [] },
        {
          id: 's3',
          submittedAt: '2026-11-10T17:27:54.000Z',
          responses: [{ questionId: 'mail', answer: 'invalide' }],
        },
      ],
    });
    expect(result).toEqual([
      {
        submissionId: 's1',
        email: 'sasa@gmail.com',
        submittedAt: new Date('2026-11-16T13:53:55.000Z'),
      },
    ]);
  });
});

describe('verifyTallySignature', () => {
  const secret = 'tally-secret';
  const sign = (payload: string) => createHmac('sha256', secret).update(payload).digest('base64');
  const body = JSON.stringify({ eventType: 'FORM_RESPONSE', data: { fields: [] } });

  it('accepts the signature of the raw body', () => {
    expect(verifyTallySignature(body, sign(body), secret)).toBe(true);
  });

  it('accepts a signature computed on the compact re-serialised payload', () => {
    const pretty = JSON.stringify(JSON.parse(body), null, 2);
    expect(verifyTallySignature(pretty, sign(body), secret)).toBe(true);
  });

  it('rejects a missing, forged or wrong-secret signature', () => {
    expect(verifyTallySignature(body, '', secret)).toBe(false);
    expect(verifyTallySignature(body, 'AAAA', secret)).toBe(false);
    expect(verifyTallySignature(body, sign(body), 'other-secret')).toBe(false);
    expect(verifyTallySignature('{not json', sign(body), secret)).toBe(false);
  });
});
