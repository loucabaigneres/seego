import { tripMonogram, tripsOverline } from './trip-list';

describe('tripsOverline', () => {
  it('counts the trips and the group ones', () => {
    expect(tripsOverline([{ groupRole: null }])).toBe('1 voyage');
    expect(
      tripsOverline([{ groupRole: null }, { groupRole: 'owner' }, { groupRole: 'member' }]),
    ).toBe('3 voyages · dont 2 groupés');
  });
});

describe('tripMonogram', () => {
  it('takes the destination first, else the title', () => {
    expect(tripMonogram({ title: 'Week-end', destination: 'lisbonne' })).toBe('Li');
    expect(tripMonogram({ title: 'Été à Séville', destination: null })).toBe('Ét');
    expect(tripMonogram({ title: ' ', destination: null })).toBe('');
  });
});
