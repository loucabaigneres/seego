import { describe, expect, it } from 'vitest';
import { grantRefusal, revokeRefusal, type RoleCandidate } from './adminRoles.js';

const traveler: RoleCandidate = {
  id: 'u2',
  email: 'new@seego.fr',
  emailVerified: true,
  role: 'traveler',
  banned: false,
};
const admin: RoleCandidate = { ...traveler, role: 'admin' };

describe('grantRefusal', () => {
  it('allows a verified traveler whose e-mail was retyped (case and spaces ignored)', () => {
    expect(grantRefusal(traveler, '  New@Seego.fr ')).toBeNull();
  });

  it('refuses when the retyped e-mail differs from the selected account', () => {
    expect(grantRefusal(traveler, 'new@seego.com')).toMatch(/ne correspond pas/);
  });

  it('refuses unknown, already admin, unverified and banned accounts', () => {
    expect(grantRefusal(undefined, traveler.email)).not.toBeNull();
    expect(grantRefusal(admin, traveler.email)).toMatch(/déjà/);
    expect(grantRefusal({ ...traveler, emailVerified: false }, traveler.email)).toMatch(/vérifié/);
    expect(grantRefusal({ ...traveler, banned: true }, traveler.email)).toMatch(/banni/);
  });
});

describe('revokeRefusal', () => {
  it('allows revoking another admin', () => {
    expect(revokeRefusal(admin, 'u1', ['u1', 'u2'])).toBeNull();
  });

  it('refuses revoking yourself or a non-admin', () => {
    expect(revokeRefusal({ ...admin, id: 'u1' }, 'u1', ['u1', 'u2'])).toMatch(/propre/);
    expect(revokeRefusal(traveler, 'u1', ['u1'])).toMatch(/pas administrateur/);
    expect(revokeRefusal(undefined, 'u1', ['u1'])).not.toBeNull();
  });

  it('never removes the last admin', () => {
    expect(revokeRefusal(admin, 'u1', ['u2'])).toMatch(/au moins un/);
  });
});
