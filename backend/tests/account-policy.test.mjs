import test from 'node:test';
import assert from 'node:assert/strict';
import { canStartSession } from '../src/common/account-policy.mjs';

test('active verified job seekers may start a session', () => {
  assert.equal(canStartSession({ status: 'ACTIVE', role: 'JOB_SEEKER', emailVerifiedAt: new Date() }), true);
});

test('pending accounts cannot start a session', () => {
  assert.equal(canStartSession({ status: 'PENDING_VERIFICATION', role: 'JOB_SEEKER', emailVerifiedAt: null }), false);
});

test('active but unverified company accounts cannot start a session', () => {
  assert.equal(canStartSession({ status: 'ACTIVE', role: 'COMPANY', emailVerifiedAt: null }), false);
});

test('banned accounts cannot start a session even when verified', () => {
  assert.equal(canStartSession({ status: 'BANNED', role: 'JOB_SEEKER', emailVerifiedAt: new Date() }), false);
});

test('active administrators do not require end-user email verification', () => {
  assert.equal(canStartSession({ status: 'ACTIVE', role: 'ADMIN', emailVerifiedAt: null }), true);
});
