import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check for email parameter from FindEmail page
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Make API call to send reset email
      const response = await axios.post('/api/auth/forgot-password', {
        email: email.trim()
      });

      // Store email in localStorage for the reset password page
      localStorage.setItem('resetEmail', email);
      
      // Use the actual token from the API response
      const resetToken = response.data.resetToken;
      localStorage.setItem('resetToken', resetToken);
      
      // Navigate directly to reset password page
      navigate(`/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`);
      
    } catch (err) {
      console.error('Forgot password error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to send recovery email. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4 pt-20 pb-12 transition-colors duration-200">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/50 p-8 transition-colors duration-200">
          {/* Back Button */}
          <Link
            to="/login"
            className="inline-flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 mb-6 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to sign in
          </Link>

          {/* Content */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">F</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Find your email</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Enter your phone number or recovery email
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Phone number or email
              </label>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Phone number or email"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isLoading || !email.trim()
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    : 'btn-primary'
                }`}
              >
                {isLoading ? 'Sending...' : 'Next'}
              </button>
            </div>
          </form>

          {/* Help Links */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700/60">
            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have access to your phone or email?
              </p>
              <Link
                to="/about"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-medium"
              >
                Get help
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword; 