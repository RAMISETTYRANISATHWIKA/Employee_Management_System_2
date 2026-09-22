import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureJwtSecret } from '../utils/jwtSecret.js';

test('generates a temporary JWT secret when env secret is blank', () => {
  const originalSecret = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;

  const secret = ensureJwtSecret();

  assert.ok(secret);
  assert.equal(secret, process.env.JWT_SECRET);
  assert.ok(secret.length >= 32);

  if (originalSecret === undefined) {
    delete process.env.JWT_SECRET;
  } else {
    process.env.JWT_SECRET = originalSecret;
  }
});
