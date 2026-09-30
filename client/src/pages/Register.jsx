import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Building2, Shield, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StudentRegister from '../components/StudentRegister';
import CompanyRegister from '../components/CompanyRegister';
import AdminRegister from '../components/AdminRegister';

function Register() {
  const [userType, setUserType] = useState('student');
  const [isHovered, setIsHovered] = useState(null);

  const userTypes = [
    { 
      value: 'student', 
      label: 'Student', 
      icon: User, 
      description: 'Looking for internship opportunities',
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      value: 'company', 
      label: 'Company', 
      icon: Building2, 
      description: 'Hiring talented interns',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      value: 'admin',
      label: 'Admin',
      icon: Shield,
      description: 'Platform administration',
      color: 'from-amber-500 to-orange-600'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: "easeOut" 
      }
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { 
        duration: 0.5, 
        ease: "easeOut" 
      }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: { 
        duration: 0.3 
      } 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 pt-24">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-80 h-80 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-10 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <motion.div 
        className="w-full max-w-4xl"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div 
          className="text-center mb-10"
          variants={itemVariants}
        >
          <motion.h1 
            className="text-4xl font-bold text-gray-800 dark:text-white"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Create Your Account
          </motion.h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
            Join thousands of students and companies finding perfect internship matches
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Type Selection */}
          <motion.div 
            className="bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/50 p-6"
            variants={itemVariants}
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
              <span className="bg-indigo-100 dark:bg-indigo-900/30 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </span>
              Select Account Type
            </h3>
            
            <div className="space-y-4">
              {userTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <motion.div
                    key={type.value}
                    className={`relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 ${
                      userType === type.value
                        ? 'ring-2 ring-offset-2 ring-indigo-500'
                        : ''
                    }`}
                    whileHover={{ 
                      y: -5,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                    }}
                    onMouseEnter={() => setIsHovered(type.value)}
                    onMouseLeave={() => setIsHovered(null)}
                    onClick={() => setUserType(type.value)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-10`}></div>
                    
                    <div className="relative p-5 flex items-start">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                        userType === type.value 
                          ? 'bg-gradient-to-br ' + type.color + ' text-white' 
                          : 'bg-indigo-50 dark:bg-gray-700'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          userType === type.value 
                            ? 'text-white' 
                            : 'text-indigo-600 dark:text-indigo-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-bold ${
                          userType === type.value 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-800 dark:text-gray-200'
                        }`}>
                          {type.label}
                        </h4>
                        <p className={`text-sm mt-1 ${
                          userType === type.value 
                            ? 'text-gray-700 dark:text-gray-300' 
                            : 'text-gray-600 dark:text-gray-400'
                        }`}>
                          {type.description}
                        </p>
                      </div>
                      
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        userType === type.value 
                          ? 'bg-indigo-600 border-indigo-600' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {userType === type.value && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    {isHovered === type.value && (
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 opacity-5"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      ></motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700/50">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Registration Form */}
          <motion.div 
            className="lg:col-span-2 bg-white dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/50 p-8"
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  {userType === 'student' && 'Student Registration'}
                  {userType === 'company' && 'Company Registration'}
                  {userType === 'admin' && 'Admin Registration'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Fill in your details to create an account
                </p>
              </div>
              
              <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-xl flex items-center justify-center">
                {userType === 'student' && <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                {userType === 'company' && <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                {userType === 'admin' && <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
              </div>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={userType}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                {userType === 'student' && <StudentRegister />}
                {userType === 'company' && <CompanyRegister />}
                {userType === 'admin' && <AdminRegister />}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
        
        <motion.div 
          className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400"
          variants={itemVariants}
        >
          © {new Date().getFullYear()} Future desk. All rights reserved.
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Register;