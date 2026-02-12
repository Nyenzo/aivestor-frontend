/**
 * Test suite for validation schemas
 */

import assert from 'node:assert';

// Import validation schemas
const { 
  loginSchema, 
  registerSchema, 
  resetPasswordSchema,
  onboardingSchema 
} = await import('../app/lib/validation.js');

// Validation Schemas Tests
(function() {

  // loginSchema tests
  try {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'Password123!'
    });
    assert.strictEqual(result.success, true);
    console.log('[PASS] loginSchema validates correct data');
  } catch (e) {
    console.error('[FAIL] loginSchema valid data:', e.message);
    process.exitCode = 1;
  }

  try {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'Password123!'
    });
    assert.strictEqual(result.success, false);
    console.log('[PASS] loginSchema rejects invalid email');
  } catch (e) {
    console.error('[FAIL] loginSchema invalid email:', e.message);
    process.exitCode = 1;
  }

  try {
    const result = loginSchema.safeParse({
      email: 'test@example.com'
    });
    assert.strictEqual(result.success, false);
    console.log('[PASS] loginSchema rejects missing password');
  } catch (e) {
    console.error('[FAIL] loginSchema missing password:', e.message);
    process.exitCode = 1;
  }

  // registerSchema tests
  try {
    const result = registerSchema.safeParse({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!'
    });
    assert.strictEqual(result.success, true);
    console.log('[PASS] registerSchema validates correct data');
  } catch (e) {
    console.error('[FAIL] registerSchema valid data:', e.message);
    process.exitCode = 1;
  }

  try {
    const result = registerSchema.safeParse({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'DifferentPassword123!'
    });
    assert.strictEqual(result.success, false);
    console.log('[PASS] registerSchema rejects mismatched passwords');
  } catch (e) {
    console.error('[FAIL] registerSchema mismatched passwords:', e.message);
    process.exitCode = 1;
  }

  try {
    const result = registerSchema.safeParse({
      displayName: 'Test User',
      email: 'test@example.com',
      password: 'weak',
      confirmPassword: 'weak'
    });
    assert.strictEqual(result.success, false);
    console.log('[PASS] registerSchema rejects weak password');
  } catch (e) {
    console.error('[FAIL] registerSchema weak password:', e.message);
    process.exitCode = 1;
  }

  // resetPasswordSchema tests
  try {
    const result = resetPasswordSchema.safeParse({
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    });
    assert.strictEqual(result.success, true);
    console.log('[PASS] resetPasswordSchema validates correct data');
  } catch (e) {
    console.error('[FAIL] resetPasswordSchema valid data:', e.message);
    process.exitCode = 1;
  }

  try {
    const result = resetPasswordSchema.safeParse({
      password: 'password123!',
      confirmPassword: 'password123!'
    });
    assert.strictEqual(result.success, false);
    console.log('[PASS] resetPasswordSchema requires uppercase');
  } catch (e) {
    console.error('[FAIL] resetPasswordSchema uppercase:', e.message);
    process.exitCode = 1;
  }

  try {
    const result = resetPasswordSchema.safeParse({
      password: 'Password!',
      confirmPassword: 'Password!'
    });
    assert.strictEqual(result.success, false);
    console.log('[PASS] resetPasswordSchema requires number');
  } catch (e) {
    console.error('[FAIL] resetPasswordSchema number:', e.message);
    process.exitCode = 1;
  }

  // onboardingSchema tests
  try {
    const result = onboardingSchema.safeParse({
      risk_level: 'medium',
      tickers: ['AAPL', 'GOOGL', 'MSFT']
    });
    assert.strictEqual(result.success, true);
    console.log('[PASS] onboardingSchema validates correct data');
  } catch (e) {
    console.error('[FAIL] onboardingSchema valid data:', e.message);
    process.exitCode = 1;
  }

  try {
    const result = onboardingSchema.safeParse({
      risk_level: 'invalid',
      tickers: ['AAPL']
    });
    assert.strictEqual(result.success, false);
    console.log('[PASS] onboardingSchema rejects invalid risk level');
  } catch (e) {
    console.error('[FAIL] onboardingSchema invalid risk level:', e.message);
    process.exitCode = 1;
  }

  try {
    const result = onboardingSchema.safeParse({
      risk_level: 'low'
    });
    assert.strictEqual(result.success, false);
    console.log('[PASS] onboardingSchema rejects missing tickers');
  } catch (e) {
    console.error('[FAIL] onboardingSchema missing tickers:', e.message);
    process.exitCode = 1;
  }
})();
