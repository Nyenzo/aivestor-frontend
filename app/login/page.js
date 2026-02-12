'use client';

// Initializing state and router for login functionality
import { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../lib/validation';
import { showError, showSuccess } from '../lib/toast';
import { signInWithGoogle } from '../lib/firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Handling form submission and API authentication
  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, data);
      localStorage.setItem('token', response.data.token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      showSuccess('Login successful!');
      const hasRiskProfile = response.data.user?.risk_level;
      router.push(hasRiskProfile ? '/dashboard' : '/onboarding');
    } catch (err) {
      showError(err?.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      const idToken = await result.user.getIdToken();

      const response = await axios.post(`${API_URL}/api/auth/google`, { idToken });
      localStorage.setItem('token', response.data.token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      showSuccess('Google login successful!');
      const hasRiskProfile = response.data.user?.risk_level;
      router.push(hasRiskProfile ? '/dashboard' : '/onboarding');
    } catch (error) {
      console.error(error);
      showError('Google sign-in failed. Please try again.');
    }
  };

  // Rendering the login form and UI components
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="bg-gray-900 p-8 rounded-xl shadow-2xl w-full max-w-md flex flex-col items-center">
        <Image src="/favicon.ico" alt="Aivestor Logo" width={64} height={64} className="w-16 h-16 mb-4" priority />
        <h1 className="text-3xl font-bold mb-6 text-center text-white">Sign in to Aivestor</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full">
          <div className="mb-4">
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full p-3 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 ${errors.email ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
                }`}
              autoFocus
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="mb-2 relative">
            <label className="block text-white mb-2">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password')}
              className={`w-full p-3 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 ${errors.password ? 'ring-2 ring-red-500' : 'focus:ring-blue-500'
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
          </div>

          <div className="mb-6 text-right">
            <a href="/forgot-password" className="text-sm text-blue-400 hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? <span className="loader mr-2"></span> : null}
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-gray-400">
          Don’t have an account? <a href="/register" className="text-blue-400 hover:underline">Register</a>
        </p>

        <div className="w-full mt-6 border-t border-gray-700 pt-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full bg-white text-gray-900 p-3 rounded hover:bg-gray-100 transition font-semibold flex items-center justify-center"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 mr-2" />
            Sign in with Google
          </button>
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