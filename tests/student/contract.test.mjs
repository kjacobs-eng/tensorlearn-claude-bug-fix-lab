import test from 'node:test';
import assert from 'node:assert/strict';
import { getClaim } from '../../src/claims.mjs';

test('trims every ID and returns the original authorized record', () => {
  const claim = { id: '  claim-B  ', ownerId: '\tuser-42\n', status: 'pending' };

  assert.strictEqual(getClaim([claim], ' user-42 ', '\nclaim-B\t'), claim);
});

test('continues past another owner with the same claim ID', () => {
  const other = { id: 'claim-B', ownerId: 'user-420', status: 'closed' };
  const own = { id: 'claim-B', ownerId: 'user-42', status: 'pending' };

  assert.strictEqual(getClaim([other, own], 'user-42', 'claim-B'), own);
});

test('preserves case and leading zeroes in both IDs', () => {
  const claim = { id: 'Claim-007', ownerId: 'User-042', status: 'pending' };

  assert.strictEqual(getClaim([claim], 'User-042', 'Claim-007'), claim);
  assert.equal(getClaim([claim], 'user-042', 'Claim-007'), null);
  assert.equal(getClaim([claim], 'User-042', 'claim-007'), null);
  assert.equal(getClaim([claim], 'User-42', 'Claim-007'), null);
  assert.equal(getClaim([claim], 'User-042', 'Claim-7'), null);
});

test('rejects non-string query IDs without coercion', () => {
  const claim = { id: '7', ownerId: '42', status: 'pending' };
  const invalid = [7, 42, 0, true, false, null, undefined, {}, ['42'], ['7'], {
    toString() { throw new Error('IDs must not be coerced'); },
  }];

  for (const value of invalid) {
    assert.equal(getClaim([claim], value, '7'), null);
    assert.equal(getClaim([claim], '42', value), null);
  }
});

test('rejects empty and whitespace-only query IDs', () => {
  const claim = { id: 'claim-B', ownerId: 'user-42', status: 'pending' };

  for (const value of ['', ' ', '\n\t']) {
    assert.equal(getClaim([claim], value, 'claim-B'), null);
    assert.equal(getClaim([claim], 'user-42', value), null);
  }
});

test('returns null for a non-array records input', () => {
  for (const records of [null, undefined, {}, 'records', 42, true, false]) {
    assert.equal(getClaim(records, 'user-42', 'claim-B'), null);
  }
});

test('malformed records cannot match or hide a later valid match', () => {
  const invalid = [
    null, undefined, 7, false, 'record', [], {},
    { id: 'claim-B' },
    { ownerId: 'user-42' },
    { id: '', ownerId: 'user-42' },
    { id: '  ', ownerId: 'user-42' },
    { id: 'claim-B', ownerId: '' },
    { id: 'claim-B', ownerId: '  ' },
    { id: ['claim-B'], ownerId: 'user-42' },
    { id: 'claim-B', ownerId: ['user-42'] },
    { id: { toString: () => 'claim-B' }, ownerId: 'user-42' },
    { id: 'claim-B', ownerId: { toString: () => 'user-42' } },
  ];
  const own = { id: 'claim-B', ownerId: 'user-42', status: 'pending' };

  assert.equal(getClaim(invalid, 'user-42', 'claim-B'), null);
  assert.strictEqual(getClaim([...invalid, own], 'user-42', 'claim-B'), own);
});

test('does not coerce numeric IDs in records', () => {
  assert.equal(getClaim([{ id: 7, ownerId: '42' }], '42', '7'), null);
  assert.equal(getClaim([{ id: '7', ownerId: 42 }], '42', '7'), null);
});

test('returns null when no authorized record exists', () => {
  const claim = { id: 'claim-B', ownerId: 'user-42', status: 'pending' };

  assert.equal(getClaim([], 'user-42', 'claim-B'), null);
  assert.equal(getClaim([claim], 'user-42', 'missing'), null);
  assert.equal(getClaim([claim], 'user-99', 'claim-B'), null);
});

test('leaves the list and records unchanged, including original ID whitespace', () => {
  const claim = Object.freeze({ id: ' claim-B ', ownerId: ' user-42 ', status: 'pending' });
  const records = Object.freeze([claim]);

  assert.strictEqual(getClaim(records, 'user-42', 'claim-B'), claim);
  assert.equal(getClaim(records, 'user-4', 'claim-B'), null);
  assert.deepEqual(records, [{ id: ' claim-B ', ownerId: ' user-42 ', status: 'pending' }]);
});
