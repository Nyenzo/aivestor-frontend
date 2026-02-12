'use client';

/**
 * Forgot Password Page
 * 
 * Allows users to request a password reset email.
 * Integrates with validation schema and toast notifications.
 */

import { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema } from '../lib/validation';
import { showError, showSuccess, showInfo } from '../lib/toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Call backend forgot password API
      await axios.post(`${API_URL}/api/auth/forgot-password`, data);
      showSuccess('Password reset email sent! Check your inbox.');
      setEmailSent(true);
    } catch (err) {
      showError(err?.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md flex flex-col items-center">
        <Image 
          src="/favicon.ico" 
          alt="Aivestor Logo" 
          width={64} 
          height={64} 
          className="w-16 h-16 mb-4" 
          priority 
        />
        
        <h1 className="text-3xl font-bold mb-2 text-center text-white">
          Forgot Password?
        </h1>
        <p className="text-gray-400 text-center mb-6">
          Enter your email and we'll send you a reset link
        </p>
        
        {emailSent ? (
          <div className="w-full bg-green-900/30 border border-green-500 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-400 mb-2">Email Sent!</h3>
            <p className="text-gray-300 text-sm">
              Check your inbox for password reset instructions. The link will expire in 1 hour.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Didn't receive it? Check your spam folder.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="w-full">
            <div className="mb-6">
              <label className="block text-white mb-2">Email Address</label>
              <input
                type="email"
                {...register('email')}
                className={`w-full p-3 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 ${
                  errors.email ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                }`}
                placeholder="you@example.com"
                autoFocus
              />
              {errors.email && (
                <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loader mr-2"></span>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}
        
        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-400">
            Remember your password?{' '}
            <a href="/login" className="text-blue-400 hover:underline">
              Back to Login
            </a>
          </p>
          {emailSent && (
            <button
              onClick={() => setEmailSent(false)}
              className="text-blue-400 hover:underline text-sm"
            >
              Try a different email
            </button>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .loader {
          border: 2px solid #f3f3f3;
          border-top: 2px solid #3498db;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
