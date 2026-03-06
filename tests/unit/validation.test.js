import { loginSchema, registerSchema, resetPasswordSchema, onboardingSchema } from '../../app/lib/validation.js';

describe('Validation Schemas', () => {
    it('loginSchema validates', () => {
        expect(loginSchema.safeParse({ email: 'test@example.com', password: 'Password123!' }).success).toBe(true);
        expect(loginSchema.safeParse({ email: 'invalid-email', password: 'Password123!' }).success).toBe(false);
        expect(loginSchema.safeParse({ email: 'test@example.com' }).success).toBe(false);
    });

    it('registerSchema validates', () => {
        expect(registerSchema.safeParse({ displayName: 'Test', email: 't@example.com', password: 'Password123!', confirmPassword: 'Password123!' }).success).toBe(true);
        expect(registerSchema.safeParse({ displayName: 'Test', email: 't@example.com', password: 'Password123!', confirmPassword: 'Different123!' }).success).toBe(false);
        expect(registerSchema.safeParse({ displayName: 'Test', email: 't@example.com', password: 'weak', confirmPassword: 'weak' }).success).toBe(false);
    });

    it('resetPasswordSchema validates', () => {
        expect(resetPasswordSchema.safeParse({ password: 'NewPassword123!', confirmPassword: 'NewPassword123!' }).success).toBe(true);
        expect(resetPasswordSchema.safeParse({ password: 'password123!', confirmPassword: 'password123!' }).success).toBe(false);
        expect(resetPasswordSchema.safeParse({ password: 'Password!', confirmPassword: 'Password!' }).success).toBe(false);
    });

    it('onboardingSchema validates', () => {
        expect(onboardingSchema.safeParse({ risk_level: 'medium', drawdown: 'sell_some', time_horizon: '2to5', volatility_comfort: 'neutral' }).success).toBe(true);
        expect(onboardingSchema.safeParse({ risk_level: 'invalid', drawdown: 'sell_some', time_horizon: '2to5', volatility_comfort: 'neutral' }).success).toBe(false);
        expect(onboardingSchema.safeParse({ risk_level: 'low' }).success).toBe(false);
    });
});
