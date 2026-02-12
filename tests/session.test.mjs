/**
 * Test suite for session management
 */

import assert from 'node:assert';

// Import session utilities
const { 
  decodeToken, 
  isTokenExpired, 
  getTimeUntilExpiry 
} = await import('../app/lib/session.js');

// Session Management Tests
(function() {

  // decodeToken tests
  try {
    const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64');
    const token = `header.${payload}.signature`;
    const decoded = decodeToken(token);
    assert.notStrictEqual(decoded, null);
    assert.ok(decoded.exp);
    console.log('[PASS] decodeToken handles valid token');
  } catch (e) {
    console.error('[FAIL] decodeToken valid token:', e.message);
    process.exitCode = 1;
  }

  try {
    const decoded = decodeToken('invalid-token');
    assert.strictEqual(decoded, null);
    console.log('[PASS] decodeToken returns null for invalid token');
  } catch (e) {
    console.error('[FAIL] decodeToken invalid token:', e.message);
    process.exitCode = 1;
  }

  try {
    const decoded = decodeToken(null);
    assert.strictEqual(decoded, null);
    console.log('[PASS] decodeToken handles null input');
  } catch (e) {
    console.error('[FAIL] decodeToken null input:', e.message);
    process.exitCode = 1;
  }

  // isTokenExpired tests
  try {
    const expiredPayload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 })).toString('base64');
    const token = `header.${expiredPayload}.signature`;
    const expired = isTokenExpired(token);
    assert.strictEqual(expired, true);
    console.log('[PASS] isTokenExpired detects expired token');
  } catch (e) {
    console.error('[FAIL] isTokenExpired expired token:', e.message);
    process.exitCode = 1;
  }

  try {
    const validPayload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64');
    const token = `header.${validPayload}.signature`;
    const expired = isTokenExpired(token);
    assert.strictEqual(expired, false);
    console.log('[PASS] isTokenExpired detects valid token');
  } catch (e) {
    console.error('[FAIL] isTokenExpired valid token:', e.message);
    process.exitCode = 1;
  }

  try {
    const expired = isTokenExpired(null);
    assert.strictEqual(expired, true);
    console.log('[PASS] isTokenExpired handles null token');
  } catch (e) {
    console.error('[FAIL] isTokenExpired null token:', e.message);
    process.exitCode = 1;
  }

  // getTimeUntilExpiry tests
  try {
    const validPayload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64');
    const token = `header.${validPayload}.signature`;
    const time = getTimeUntilExpiry(token);
    assert.ok(time > 0);
    console.log('[PASS] getTimeUntilExpiry returns positive time');
  } catch (e) {
    console.error('[FAIL] getTimeUntilExpiry valid token:', e.message);
    process.exitCode = 1;
  }

  try {
    const expiredPayload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 })).toString('base64');
    const token = `header.${expiredPayload}.signature`;
    const time = getTimeUntilExpiry(token);
    assert.strictEqual(time, 0);
    console.log('[PASS] getTimeUntilExpiry returns 0 for expired token');
  } catch (e) {
    console.error('[FAIL] getTimeUntilExpiry expired token:', e.message);
    process.exitCode = 1;
  }

  try {
    const time = getTimeUntilExpiry(null);
    assert.strictEqual(time, 0);
    console.log('[PASS] getTimeUntilExpiry handles null token');
  } catch (e) {
    console.error('[FAIL] getTimeUntilExpiry null token:', e.message);
    process.exitCode = 1;
  }
})();
