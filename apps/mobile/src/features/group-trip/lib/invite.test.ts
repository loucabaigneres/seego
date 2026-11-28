import {
  groupCardState,
  inviteStatus,
  inviteUrl,
  isCodeRejected,
  joinErrorMessage,
  parseInviteCode,
  waitingMembers,
} from './invite';

describe('inviteUrl', () => {
  it('points to the web join page', () => {
    expect(inviteUrl('https://seego.app/', 'ABCD2345')).toBe('https://seego.app/join/ABCD2345');
  });
});

describe('inviteStatus', () => {
  const now = new Date('2026-11-17T12:00:00Z');

  it('counts the hours left, rounded up', () => {
    expect(inviteStatus('2026-11-17T17:30:00Z', now)).toEqual({ expired: false, hoursLeft: 6 });
  });

  it('is expired past the date, or without one', () => {
    expect(inviteStatus('2026-11-17T11:00:00Z', now)).toEqual({ expired: true, hoursLeft: 0 });
    expect(inviteStatus(null, now).expired).toBe(true);
  });
});

describe('parseInviteCode', () => {
  it('upper-cases a typed code and drops its spaces', () => {
    expect(parseInviteCode(' abcd 2345 ')).toBe('ABCD2345');
  });

  it('takes the code out of a pasted link', () => {
    expect(parseInviteCode('Rejoins-moi : https://seego.app/join/abcd2345?x=1')).toBe('ABCD2345');
    expect(parseInviteCode('seego://join/ABCD2345')).toBe('ABCD2345');
  });

  it('keeps at most 8 characters, the length the API generates', () => {
    expect(parseInviteCode('ABCD2345ABCD2345')).toBe('ABCD2345');
  });

  it('gives nothing for an empty input', () => {
    expect(parseInviteCode('   ')).toBeNull();
  });
});

describe('groupCardState', () => {
  const solo = { isGroup: false, userId: 'me' };
  const group = { isGroup: true, userId: 'host' };

  it('offers the owner to invite friends', () => {
    expect(groupCardState(solo, 'me')).toBe('invite');
  });

  it('hides the offer on someone else’s trip', () => {
    expect(groupCardState(solo, 'other')).toBe('hidden');
  });

  it('asks a guest to sign in', () => {
    expect(groupCardState(solo, null)).toBe('sign-in');
    expect(groupCardState(group, null)).toBe('sign-in');
  });

  it('shows the group to any signed-in viewer', () => {
    expect(groupCardState(group, 'member')).toBe('active');
  });
});

describe('waitingMembers', () => {
  it('names up to three members', () => {
    expect(waitingMembers([])).toBeNull();
    expect(waitingMembers(['Léa'])).toBe('Léa t’attend.');
    expect(waitingMembers(['Léa', 'Tom'])).toBe('Léa et Tom t’attendent.');
    expect(waitingMembers(['Léa', 'Tom', 'Inès'])).toBe('Léa, Tom et Inès t’attendent.');
  });

  it('counts the rest past three', () => {
    expect(waitingMembers(['Léa', 'Tom', 'Inès', 'Sam'])).toBe('Léa, Tom et 2 autres t’attendent.');
  });
});

describe('joinErrorMessage', () => {
  it('tells an unknown code from an expired one', () => {
    expect(joinErrorMessage('NOT_FOUND').message).toMatch(/aucun voyage/);
    expect(joinErrorMessage('BAD_REQUEST').title).toMatch(/expiré/);
    expect(joinErrorMessage(undefined).message).toMatch(/Réessaie/);
  });

  it('only rejects the code itself for an unknown or expired one', () => {
    expect(isCodeRejected('NOT_FOUND')).toBe(true);
    expect(isCodeRejected('BAD_REQUEST')).toBe(true);
    expect(isCodeRejected('INTERNAL_SERVER_ERROR')).toBe(false);
  });
});
