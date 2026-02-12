'use client';

// Setting up state and router for registration process
import { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, getPasswordStrengthInfo } from '../lib/validation';
import { showError, showSuccess } from '../lib/toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
  
  const password = useWatch({ control, name: 'password', defaultValue: '' });
  const passwordStrength = getPasswordStrengthInfo(password);

  // Handling registration submission and API call
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/register`, { 
        email: data.email, 
        password: data.password, 
        risk_tolerance: 0.5 
      });
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, { 
        email: data.email, 
        password: data.password 
      });
      localStorage.setItem('token', loginResponse.data.token);
      if (loginResponse.data.user) {
        localStorage.setItem('user', JSON.stringify(loginResponse.data.user));
      }
      showSuccess('Account created successfully!');
      router.push('/onboarding');
    } catch (err) {
      showError(err?.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  // Rendering the registration form and UI elements
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md flex flex-col items-center">
  <Image src="/favicon.ico" alt="Aivestor Logo" width={64} height={64} className="w-16 h-16 mb-4" priority />
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Create your Aivestor account</h1>
        
        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <div className="mb-4">
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full p-3 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 ${
                errors.email ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
              }`}
              autoFocus
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>
          
          <div className="mb-4 relative">
            <label className="block text-white mb-2">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={`w-full p-3 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 ${
                errors.password ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-blue-400"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
            {errors.password && (
              <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
            )}
            {password && !errors.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${passwordStrength.color}`}
                      style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400">{passwordStrength.label}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="mb-6 relative">
            <label className="block text-white mb-2">Confirm Password</label>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              {...register('confirmPassword')}
              className={`w-full p-3 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 ${
                errors.confirmPassword ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
              }`}
            />
            <button
              type="button"
              className="absolute right-3 top-9 text-gray-400 hover:text-blue-400"
              onClick={() => setShowConfirmPassword((v) => !v)}
              tabIndex={-1}
            >
              {showConfirmPassword ? 'Hide' : 'Show'}
            </button>
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <span className="loader mr-2"></span> : null}
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          Already have an account? <a href="/login" className="text-blue-400 hover:underline">Login</a>
        </p>
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