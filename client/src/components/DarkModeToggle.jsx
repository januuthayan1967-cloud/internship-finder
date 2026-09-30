import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function DarkModeToggle({ className = '', compact = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle Dark Mode"
      className={`relative ${compact ? 'p-2' : 'p-3'} rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 overflow-hidden ${
        isDark 
          ? 'bg-gray-800 text-yellow-300 shadow-lg shadow-yellow-500/20' 
          : 'bg-white text-gray-700 shadow-lg shadow-gray-500/20 border border-gray-200'
      } ${className}`}
      whileHover={{ 
        scale: 1.1,
        boxShadow: isDark 
          ? '0 0 20px rgba(251, 191, 36, 0.4)' 
          : '0 0 20px rgba(59, 130, 246, 0.3)'
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        boxShadow: isDark 
          ? [
              '0 0 0 rgba(251, 191, 36, 0)',
              '0 0 15px rgba(251, 191, 36, 0.3)',
              '0 0 0 rgba(251, 191, 36, 0)'
            ]
          : [
              '0 0 0 rgba(59, 130, 246, 0)',
              '0 0 15px rgba(59, 130, 246, 0.2)',
              '0 0 0 rgba(59, 130, 246, 0)'
            ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Glowing background effect */}
      <motion.div
        className={`absolute inset-0 rounded-full ${
          isDark 
            ? 'bg-gradient-to-br from-yellow-400/20 to-orange-500/20' 
            : 'bg-gradient-to-br from-blue-400/20 to-indigo-500/20'
        }`}
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          background: [
            'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
            'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Icon container */}
      <motion.div
        className="relative z-10"
        animate={{
          rotate: [0, 5, 0, -5, 0]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="sun"
              initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Sun className={compact ? "w-5 h-5" : "w-6 h-6"} />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ opacity: 0, scale: 0.5, rotate: 90 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: -90 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Moon className={compact ? "w-5 h-5" : "w-6 h-6"} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Pulse ring effect */}
      <motion.div
        className={`absolute inset-0 rounded-full border-2 ${
          isDark 
            ? 'border-yellow-400/30' 
            : 'border-indigo-400/30'
        }`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.button>
  );
}
