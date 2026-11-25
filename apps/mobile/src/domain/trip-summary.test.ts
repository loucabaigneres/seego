import {
  tripDateRange,
  tripDisplayTitle,
  tripFacts,
  tripMonogram,
  tripPickerDetails,
  tripStatusMeta,
} from './trip-summary';

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

describe('tripMonogram', () => {
  it('takes the destination first, else the title', () => {
    expect(tripMonogram({ title: 'Week-end', destination: 'lisbonne' })).toBe('Li');
    expect(tripMonogram({ title: 'Été à Séville', destination: null })).toBe('Ét');
    expect(tripMonogram({ title: ' ', destination: null })).toBe('');
  });
});

describe('tripDateRange', () => {
  it('shortens a range within one month', () => {
    expect(tripDateRange({ startDate: '2026-07-12', durationDays: 5 })).toBe('12 – 16 juil.');
  });

  it('keeps both months across a month change', () => {
    expect(tripDateRange({ startDate: '2026-07-30', durationDays: 4 })).toBe('30 juil. – 2 août');
  });

  it('is empty without a start date', () => {
    expect(tripDateRange({ startDate: null, durationDays: 3 })).toBe('');
  });
});

describe('tripPickerDetails', () => {
  it('shows the dates and steps, else the status', () => {
    expect(
      tripPickerDetails({
        startDate: '2026-07-12',
        durationDays: 5,
        stepsCount: 13,
        status: 'finalized',
      }),
    ).toBe('12 – 16 juil. · 13 étapes');
    expect(tripPickerDetails({ startDate: null, stepsCount: 0, status: 'draft' })).toBe(
      'Brouillon',
    );
  });
});
