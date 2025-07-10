'use client';

// Initializing state and router for login functionality
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Handling form submission and API authentication
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      router.push('/risk-assessment');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  // Rendering the login form and UI components
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Login</h1>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-white mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-white mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 bg-gray-700 text-white rounded"
              required
            />
          </div>
          <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          Don’t have an account? <a href="/register" className="text-blue-400">Register</a>
        </p>
      </div>
    </div>
  );
}