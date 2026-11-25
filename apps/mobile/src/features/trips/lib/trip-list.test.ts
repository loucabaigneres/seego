import { tripsOverline } from './trip-list';

describe('tripsOverline', () => {
  it('counts the trips and the group ones', () => {
    expect(tripsOverline([{ groupRole: null }])).toBe('1 voyage');
    expect(
      tripsOverline([{ groupRole: null }, { groupRole: 'owner' }, { groupRole: 'member' }]),
    ).toBe('3 voyages · dont 2 groupés');
  });
});
