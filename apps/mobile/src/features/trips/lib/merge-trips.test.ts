import { mergeTrips } from './merge-trips';

const owned = (id: string, createdAt: string) =>
  ({ id, title: null, destination: 'Lisbonne', status: 'draft', createdAt }) as never;
const group = (id: string, createdAt: string, role: 'owner' | 'member') =>
  ({
    id,
    title: null,
    destination: 'Rome',
    status: 'draft',
    createdAt,
    role,
    inviteCode: 'ABCD2345',
    inviteCodeExpiresAt: null,
    memberCount: 2,
    members: [{ id: 'u1', name: 'Léa' }],
    ownerName: 'Léa',
  }) as never;

describe('mergeTrips', () => {
  it('shows a hosted group trip once, with its role', () => {
    const trips = mergeTrips([owned('a', '2026-11-01')], [group('a', '2026-11-01', 'owner')]);
    expect(trips).toHaveLength(1);
    expect(trips[0]).toMatchObject({
      id: 'a',
      groupRole: 'owner',
      group: { memberCount: 2, ownerName: 'Léa', members: [{ id: 'u1', name: 'Léa' }] },
    });
  });

  it('adds the joined trips and keeps solo ones without a role, newest first', () => {
    const trips = mergeTrips(
      [owned('solo', '2026-11-01'), owned('old', '2026-10-01')],
      [group('joined', '2026-11-10', 'member')],
    );
    expect(trips.map((t) => [t.id, t.groupRole])).toEqual([
      ['joined', 'member'],
      ['solo', null],
      ['old', null],
    ]);
  });
});
