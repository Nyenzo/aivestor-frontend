

import { z } from 'zod';

// AUTHENTICATION SCHEMAS

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
});

export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
});

// PROFILE SCHEMAS

export const profileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  phone: z
    .string()
    .regex(/^(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/, {
      message: 'Invalid phone number format'
    })
    .optional()
    .or(z.literal('')),
  risk_level: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Please select a valid risk level' })
  })
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(1, 'New password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your new password')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword']
});

// ONBOARDING SCHEMA

export const onboardingSchema = z.object({
  risk_level: z.enum(['low', 'medium', 'high'], {
    errorMap: () => ({ message: 'Please select your risk tolerance' })
  }),
  drawdown: z.string().min(1, 'Please select an option'),
  time_horizon: z.string().min(1, 'Please select an option'),
  volatility_comfort: z.string().min(1, 'Please select an option')
});

// TRADING SCHEMAS

export const buyStockSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Stock symbol is required')
    .max(10, 'Invalid stock symbol')
    .toUpperCase(),
  quantity: z
    .number()
    .min(1, 'Quantity must be at least 1')
    .int('Quantity must be a whole number'),
  price: z
    .number()
    .min(0.01, 'Price must be greater than 0')
});

export const sellStockSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Stock symbol is required')
    .max(10, 'Invalid stock symbol')
    .toUpperCase(),
  quantity: z
    .number()
    .min(1, 'Quantity must be at least 1')
    .int('Quantity must be a whole number'),
  price: z
    .number()
    .min(0.01, 'Price must be greater than 0')
});

// WATCHLIST SCHEMA

export const addToWatchlistSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Stock symbol is required')
    .max(10, 'Invalid stock symbol')
    .toUpperCase(),
  name: z
    .string()
    .min(1, 'Company name is required')
    .optional()
});

// CHAT SCHEMA

export const chatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(1000, 'Message is too long (max 1000 characters)')
});

// UTILITY FUNCTIONS

export function validateSchema(schema, data) {
  try {
    schema.parse(data);
    return { success: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      errors[path] = err.message;
    });
    return { success: false, errors };
  }
}

export function getPasswordStrength(password) {
  let score = 0;

  if (!password) return score;

  // Length check
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  return Math.min(score, 4);
}

export function getPasswordStrengthInfo(password) {
  const strength = getPasswordStrength(password);

  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['red', 'orange', 'yellow', 'lime', 'green'];

  return {
    strength,
    label: labels[strength],
    color: colors[strength]
  };
}

export default {
  // Auth
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,

  // Profile
  profileSchema,
  changePasswordSchema,

  // Onboarding
  onboardingSchema,

  // Trading
  buyStockSchema,
  sellStockSchema,

  // Watchlist
  addToWatchlistSchema,

  // Chat
  chatMessageSchema,

  // Utilities
  validateSchema,
  getPasswordStrength,
  getPasswordStrengthInfo
};
