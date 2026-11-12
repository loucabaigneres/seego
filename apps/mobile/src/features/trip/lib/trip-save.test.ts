import { tripSaveState } from './trip-save';

describe('tripSaveState', () => {
  it('asks a guest to sign in', () => {
    expect(tripSaveState({ status: 'finalized', userId: 'user-1' }, null)).toBe('sign-in');
  });

  it('offers to save a trip that is not finalized yet', () => {
    expect(tripSaveState({ status: 'draft', userId: 'user-1' }, 'user-1')).toBe('save');
  });

  it('offers to save a trip finalized in someone else’s account', () => {
    expect(tripSaveState({ status: 'finalized', userId: 'user-2' }, 'user-1')).toBe('save');
  });

  it('shows a finalized trip of the user as saved', () => {
    expect(tripSaveState({ status: 'finalized', userId: 'user-1' }, 'user-1')).toBe('saved');
  });
});
