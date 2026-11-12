import { tripDisplayTitle, tripFacts, tripStatusMeta } from './trip-summary';

describe('tripStatusMeta', () => {
  it('translates each status', () => {
    expect(tripStatusMeta('draft').label).toBe('Brouillon');
    expect(tripStatusMeta('finalized')).toEqual({ label: 'Finalisé', tone: 'success' });
    expect(tripStatusMeta('archived').label).toBe('Archivé');
  });

  it('treats an unknown status as a draft', () => {
    expect(tripStatusMeta('something-new')).toEqual(tripStatusMeta('draft'));
    expect(tripStatusMeta(null)).toEqual(tripStatusMeta('draft'));
  });
});

describe('tripDisplayTitle', () => {
  it('prefers the trip title', () => {
    expect(tripDisplayTitle({ title: ' Week-end à Rome ', destination: 'Rome' })).toBe(
      'Week-end à Rome',
    );
  });

  it('falls back on the destination, then on a neutral label', () => {
    expect(tripDisplayTitle({ title: '  ', destination: 'Lisbonne' })).toBe('Voyage à Lisbonne');
    expect(tripDisplayTitle({})).toBe('Voyage sans destination');
  });
});

describe('tripFacts', () => {
  it('lists the date, the length and the planned stops', () => {
    expect(tripFacts({ startDate: '2026-01-12T12:00:00', durationDays: 3 }, 12, 'long')).toEqual([
      '12 janvier 2026',
      '3 jours',
      '12 étapes',
    ]);
  });

  it('leaves out what the trip does not have', () => {
    expect(tripFacts({ startDate: null, durationDays: 1 }, 0)).toEqual(['1 jour']);
    expect(tripFacts({}, 0)).toEqual([]);
  });
});
