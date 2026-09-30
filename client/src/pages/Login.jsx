import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Building2, Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'student'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await login(formData.email, formData.password, formData.userType);
      
      if (result.success) {
        navigate(`/${formData.userType}/dashboard`);
      } else {
        setError(result.message || 'Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email first.');
      return;
    }

    setOtpLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/auth/send-otp', { email: formData.email });
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const userTypes = [
    { value: 'student', label: 'Student', icon: User, description: 'Looking for internships', color: 'from-blue-500 to-indigo-600' },
    { value: 'company', label: 'Company', icon: Building2, description: 'Hiring interns', color: 'from-emerald-500 to-teal-600' },
    { value: 'admin', label: 'Admin', icon: Shield, description: 'Platform administration', color: 'from-amber-500 to-orange-600' }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 pt-20">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-80 h-80 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <motion.div 
        className="w-full max-w-lg"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="text-center mb-10"
          variants={itemVariants}
        >
          <div className="mx-auto w-20 h-20 mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
            <Lock className="w-10 h-10 text-white" />
          </div>
          <motion.h1 
            className="text-3xl font-bold text-gray-800 dark:text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Welcome Back
          </motion.h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Sign in to continue to your account
          </p>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/50 p-8"
          variants={itemVariants}
          whileHover={{ 
            boxShadow: "0 20px 40px rgba(99, 102, 241, 0.15)"
          }}
          transition={{ duration: 0.3 }}
        >
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* User Type Selection */}
            <motion.div 
              className="form-group"
              variants={itemVariants}
            >
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                I am a
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {userTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <motion.label
                      key={type.value}
                      className={`relative flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                        formData.userType === type.value
                          ? 'bg-gradient-to-br ' + type.color + ' text-white shadow-lg'
                          : 'bg-white dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:border-indigo-300'
                      }`}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={type.value}
                        checked={formData.userType === type.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                        formData.userType === type.value 
                          ? 'bg-white/20' 
                          : 'bg-indigo-50 dark:bg-gray-600'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          formData.userType === type.value 
                            ? 'text-white' 
                            : 'text-indigo-600 dark:text-indigo-400'
                        }`} />
                      </div>
                      <div className="text-center">
                        <div className={`font-medium ${
                          formData.userType === type.value 
                            ? 'text-white' 
                            : 'text-gray-900 dark:text-gray-100'
                        }`}>
                          {type.label}
                        </div>
                        <div className={`text-xs mt-1 ${
                          formData.userType === type.value 
                            ? 'text-white/80' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {type.description}
                        </div>
                      </div>
                    </motion.label>
                  );
                })}
              </div>
            </motion.div>

            {/* Email */}
            <motion.div 
              className="form-group"
              variants={itemVariants}
            >
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div 
              className="form-group"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link to="/find-email" className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
            </motion.div>

            {error && (
              <motion.div 
                className="px-4 py-3 text-sm text-red-700 bg-red-100 rounded-lg flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div 
              className="pt-4"
              variants={itemVariants}
            >
              <motion.button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg transition-all ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                }`}
                whileHover={!loading ? { scale: 1.02 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in to your account'
                  )}
                </div>
              </motion.button>
            </motion.div>

            {/* OTP Button */}
            <motion.div 
              className="pt-3"
              variants={itemVariants}
            >
              <motion.button
                type="button"
                onClick={handleSendOtp}
                disabled={otpLoading || !formData.email}
                className={`w-full py-2 px-4 rounded-lg font-medium text-sm border-2 transition-all ${
                  otpLoading || !formData.email
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed' 
                    : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20'
                }`}
                whileHover={!otpLoading && formData.email ? { scale: 1.02 } : {}}
                whileTap={!otpLoading && formData.email ? { scale: 0.98 } : {}}
              >
                <div className="flex items-center justify-center">
                  {otpLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending OTP...
                    </>
                  ) : (
                    'Login with OTP instead'
                  )}
                </div>
              </motion.button>
            </motion.div>
          </form>

          <motion.div 
            className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400"
            variants={itemVariants}
          >
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              Sign up now
            </Link>
          </motion.div>
        </motion.div>

        <motion.div 
          className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400"
          variants={itemVariants}
        >
          © {new Date().getFullYear()} Future desk. All rights reserved.
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;