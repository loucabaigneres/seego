import {
  addDays,
  formatDate,
  formatDayMonth,
  parseIsoDate,
  pluralize,
  toIsoDate,
  tripDurationDays,
} from './date';

describe('formatDayMonth', () => {
  it('drops the year', () => {
    expect(formatDayMonth('2026-11-27T10:00:00Z')).toBe('27 nov.');
  });

  it('returns an empty string for missing or invalid dates', () => {
    expect(formatDayMonth(null)).toBe('');
    expect(formatDayMonth('not a date')).toBe('');
  });
});

describe('formatDate', () => {
  it('formats an ISO date in French', () => {
    expect(formatDate('2026-01-12T10:00:00Z', 'long')).toBe('12 janvier 2026');
  });

  it('returns an empty string for missing or invalid dates', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate('not a date')).toBe('');
  });
});

describe('toIsoDate / parseIsoDate', () => {
  it('keeps the local day, even just before midnight', () => {
    expect(toIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('round-trips a day', () => {
    const date = parseIsoDate('2026-11-03');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 10, 3]);
    expect(toIsoDate(date)).toBe('2026-11-03');
  });
});

describe('toIsoDate / parseIsoDate', () => {
  it('keeps the local day, even just before midnight', () => {
    expect(toIsoDate(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('round-trips a day', () => {
    const date = parseIsoDate('2026-11-03');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 10, 3]);
    expect(toIsoDate(date)).toBe('2026-11-03');
  });
});

describe('plural', () => {
  it('pluralises above one', () => {
    expect(pluralize(1, 'jour')).toBe('1 jour');
    expect(pluralize(3, 'jour')).toBe('3 jours');
    expect(pluralize(2, 'étape')).toBe('2 étapes');
  });
});

describe('addDays / tripDurationDays', () => {
  it('moves across months, years and daylight-saving changes', () => {
    expect(addDays('2026-10-24', 13)).toBe('2026-11-06');
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
  });

  it('counts both the departure and the return day', () => {
    expect(tripDurationDays('2026-11-03', '2026-11-03')).toBe(1);
    expect(tripDurationDays('2026-10-24', '2026-11-06')).toBe(14);
  });
});
