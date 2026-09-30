import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, Mail, Phone } from 'lucide-react';
import axios from 'axios';

const FindEmail = () => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [foundEmail, setFoundEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!identifier.trim()) {
      setError('Please enter your phone number or recovery email');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setFoundEmail('');

    try {
      // Make API call to find email by phone number or recovery email
      const response = await axios.post('/api/auth/find-email', {
        identifier: identifier.trim()
      });

      if (response.data.success) {
        setSuccess('Email found successfully!');
        setFoundEmail(response.data.email);
        
        // Store email for password reset flow
        localStorage.setItem('resetEmail', response.data.email);
        
        // Navigate to forgot password page with the found email
        setTimeout(() => {
          window.location.href = `/forgot-password?email=${encodeURIComponent(response.data.email)}`;
        }, 2000);
      }
      
    } catch (err) {
      console.error('Find email error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'No account found with this phone number or recovery email.';
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
              <Search className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Find your email</h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Enter your phone number or recovery email
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded-xl text-sm">
                {success}
                {foundEmail && (
                  <div className="mt-2 text-sm font-semibold">
                    Email: {foundEmail}
                  </div>
                )}
              </div>
            )}

            {/* Phone number or email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Phone number or recovery email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter phone or recovery email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !identifier.trim()}
              className={`w-full py-3 px-4 rounded-xl font-medium transition-all ${
                isLoading || !identifier.trim()
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'btn-primary'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Finding...
                </div>
              ) : (
                'Find Email'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FindEmail; 