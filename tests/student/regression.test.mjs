import test from 'node:test';
import assert from 'node:assert/strict';
import { getClaim } from '../../src/claims.mjs';

test('user-4 cannot access claim-B owned by user-42', () => {
  const claim = { id: 'claim-B', ownerId: 'user-42', status: 'pending' };

  assert.equal(getClaim([claim], 'user-4', 'claim-B'), null);
});
