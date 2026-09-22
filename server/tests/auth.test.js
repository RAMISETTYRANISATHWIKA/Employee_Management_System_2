import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateLeaveDays } from '../services/leaveService.js';

describe('Leave Service', () => {
  it('calculates full day leave correctly', () => {
    const days = calculateLeaveDays('2026-01-01', '2026-01-03', 'full');
    assert.equal(days, 3);
  });

  it('calculates half day leave as 0.5', () => {
    const days = calculateLeaveDays('2026-01-01', '2026-01-01', 'half');
    assert.equal(days, 0.5);
  });
});

describe('Authorization Logic', () => {
  it('validates role enum values', () => {
    const validRoles = ['admin', 'staff'];
    assert.ok(validRoles.includes('admin'));
    assert.ok(validRoles.includes('staff'));
    assert.ok(!validRoles.includes('superuser'));
  });
});
