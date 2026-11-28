import { groupRowCaption, isDestinationPending, membersLabel } from './group';

const lea = { id: 'u1', name: 'Léa Martin' };
const tom = { id: 'u2', name: 'Tom Garnier' };
const ines = { id: 'u3', name: 'Inès' };

describe('isDestinationPending', () => {
  it('treats an empty destination as pending', () => {
    expect(isDestinationPending(null)).toBe(true);
    expect(isDestinationPending('  ')).toBe(true);
    expect(isDestinationPending('Lisbonne')).toBe(false);
  });
});

describe('membersLabel', () => {
  it('puts the current user first as "Toi" and uses first names', () => {
    expect(membersLabel([tom, lea, ines], 'u1')).toBe('Toi, Tom et Inès');
  });

  it('counts the members not listed', () => {
    expect(membersLabel([lea, tom, ines], 'u1', 5)).toBe('Toi, Tom, Inès et 2 autres');
    expect(membersLabel([lea, tom], 'u1', 3)).toBe('Toi, Tom et 1 autre');
  });

  it('handles a group of one, and a user not in the list', () => {
    expect(membersLabel([lea], 'u1')).toBe('Toi');
    expect(membersLabel([tom, ines], 'u1')).toBe('Tom et Inès');
  });
});

describe('groupRowCaption', () => {
  it('shows the count to the organizer and the organizer to a member', () => {
    expect(groupRowCaption('owner', 3, 'Léa Martin')).toBe('3 participants');
    expect(groupRowCaption('owner', 1, 'Léa Martin')).toBe('Rien que toi pour l’instant');
    expect(groupRowCaption('member', 4, 'Marie Lefèvre')).toBe('Organisé par Marie');
  });
});
