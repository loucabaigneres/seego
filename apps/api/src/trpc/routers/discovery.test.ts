import { describe, expect, it } from 'vitest';
import { regeneratedTripTitle } from './discovery.js';
import { DEFAULT_GROUP_TRIP_TITLE } from './group.js';

describe('regeneratedTripTitle', () => {
  it('names an unnamed group trip after the city', () => {
    const current = { title: DEFAULT_GROUP_TRIP_TITLE, destination: null };
    expect(regeneratedTripTitle(current, 'Lisbonne')).toBe('Voyage à Lisbonne');
  });

  it('keeps a title the host chose', () => {
    const current = { title: 'Les 30 ans de Sam', destination: null };
    expect(regeneratedTripTitle(current, 'Lisbonne')).toBe('Les 30 ans de Sam');
  });

  it('follows the new city when the title was the previous automatic one', () => {
    const current = { title: 'Voyage à Rome', destination: 'Rome' };
    expect(regeneratedTripTitle(current, 'Lisbonne')).toBe('Voyage à Lisbonne');
  });

  it('names a trip with no title', () => {
    expect(regeneratedTripTitle({ title: null, destination: null }, 'Lisbonne')).toBe(
      'Voyage à Lisbonne',
    );
  });
});
