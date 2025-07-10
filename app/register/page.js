'use client';

// Setting up state and router for registration process
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  // Handling registration submission and API call
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', { email, password, risk_tolerance: 0.5 });
      router.push('/risk-assessment');
    } catch (err) {
      setError('Registration failed');
    }
  };

  // Rendering the registration form and UI elements
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-white">Register</h1>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleRegister}>
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
            Register
          </button>
        </form>
        <p className="mt-4 text-center text-gray-400">
          Already have an account? <a href="/login" className="text-blue-400">Login</a>
        </p>
      </div>
    </div>
  );
}