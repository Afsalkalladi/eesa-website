import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout/Layout';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { redirect, registered } = router.query;

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (isAuthenticated()) {
      router.push(redirect || '/dashboard');
    }
  }, [isAuthenticated, router, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await login({ username, password });
      router.push(redirect || '/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // If already authenticated, don't render the form
  // If already authenticated, don't render the form
  if (isAuthenticated()) {
    return null; // Will redirect in useEffect
  }

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-8">
        {registered && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            Registration successful! You can now login to your account.
          </div>
        )}
        
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Login to EESA</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <p className="mt-4 text-center text-gray-600">
            Don't have an account?{' '}
            <Link href="/register">
              <span className="text-blue-600 hover:underline cursor-pointer">Register</span>
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;