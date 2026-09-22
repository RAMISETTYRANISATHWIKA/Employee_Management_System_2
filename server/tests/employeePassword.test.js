import test from 'node:test';
import assert from 'node:assert/strict';
import { buildEmployeePassword } from '../utils/employeePassword.js';

test('generates a secure password when the admin leaves it blank', () => {
  const password = buildEmployeePassword('');

  assert.ok(password);
  assert.ok(password.length >= 10);
  assert.match(password, /[A-Za-z0-9!@#$%^&*]/);
});

test('keeps an explicitly provided password unchanged', () => {
  const password = buildEmployeePassword('MyStrongPass@123');

  assert.equal(password, 'MyStrongPass@123');
});
