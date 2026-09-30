import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import {
  User,
  Bell,
  Calendar,
  CheckCircle,
  AlertCircle,
  FileText,
  Camera,
  ArrowRight,
  Moon,
  Sun,
  Zap,
  Briefcase,
  Award,
  Clock,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function StudentDashboard() {
  const { user } = useAuth();
  const { isDark: darkMode, toggleTheme: toggleDarkMode } = useTheme();
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [missedInterviews, setMissedInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [glowIndex, setGlowIndex] = useState(0);
  const [selectedStat, setSelectedStat] = useState(null);
  const [showStatModal, setShowStatModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlowIndex((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, notificationsRes, interviewsRes, missedInterviewsRes] = await Promise.all([
        axios.get('/api/students/profile'),
        axios.get('/api/students/notifications'),
        axios.get('/api/students/interviews'),
        axios.get('/api/students/missed-interviews')
      ]);

      setProfile(profileRes.data);
      setNotifications(notificationsRes.data.slice(0, 5));
      setMissedInterviews(missedInterviewsRes.data.slice(0, 3));
      
      // Filter out expired interviews that haven't been joined
      const currentTime = new Date();
      const currentTimeString = currentTime.toTimeString().split(' ')[0];
      
      const validInterviews = interviewsRes.data.filter(interview => {
        if (interview.status !== 'scheduled') return true;
        
        const interviewDate = new Date(interview.scheduledDate);
        const interviewTime = interview.scheduledTime;
        
        // Keep if interview is in the future, or if it's today but time hasn't passed yet
        const isExpired = interviewDate < currentTime || 
          (interviewDate.toDateString() === currentTime.toDateString() && interviewTime < currentTimeString);
        
        // Only show if not expired or if student joined
        return !isExpired || interview.joined;
      });
      
      setInterviews(validInterviews.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(`/api/students/notifications/${notificationId}/read`);
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleJoin = async (interview) => {
    try {
      // Mark the interview as joined first
      // await axios.put(`/api/students/interview/${interview._id}/join`);
      
      // Then navigate to the video room
      navigate(`/student/zehoNew/${interview._id}`);
    } catch (error) {
      console.error('Failed to mark interview as joined:', error);
      // Still navigate to the video room even if marking as joined fails
      navigate(`/student/zehoNew/${interview._id}`);
    }
  };

  const handleStatCardClick = (statTitle) => {
    setSelectedStat(statTitle);
    setShowStatModal(true);
  };

  const makeUploadsUrl = (rawPath, type) => {
    if (!rawPath) return '';
    try {
      let p = String(rawPath).replace(/\\\\/g, '/').replace(/\\/g, '/');
      const lower = p.toLowerCase();
      const idx = lower.indexOf('/uploads/');
      if (idx >= 0) return p.slice(idx);
      const subdirs = ['cvs/', 'profiles/', 'documents/', 'certificates/', 'posts/'];
      for (const sub of subdirs) {
        const pos = lower.lastIndexOf(sub);
        if (pos >= 0) return `/uploads/${p.slice(pos)}`;
      }
      const filename = p.split('/').pop();
      const dir = type === 'cv' ? 'cvs' : type === 'profile' ? 'profiles' : '';
      return dir ? `/uploads/${dir}/${filename}` : `/uploads/${filename}`;
    } catch (_) {
      return '';
    }
  };

  const closeStatModal = () => {
    setShowStatModal(false);
    setSelectedStat(null);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to sign out and permanently delete your account? This action cannot be undone.')) return;
    try {
      await axios.delete('/api/students/profile');
      localStorage.clear();
      sessionStorage.clear();
      alert('Your account has been deleted successfully');
      window.location.href = '/';
    } catch (err) {
      console.error('Student account deletion error:', err);
      alert(err.response?.data?.message || 'Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"
        ></motion.div>
      </div>
    );
  }

  if (!profile?.profileCompleted) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`rounded-xl shadow-lg ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-8 text-center border`}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.05, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            </motion.div>
            <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Complete Your Profile
            </h2>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              You need to complete your profile to start receiving internship opportunities.
            </p>
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: darkMode 
                  ? ['0 0 0px rgba(255, 255, 255, 0)', '0 0 15px rgba(255, 255, 255, 0.3)', '0 0 0px rgba(255, 255, 255, 0)'] 
                  : ['0 0 0px rgba(59, 130, 246, 0)', '0 0 15px rgba(59, 130, 246, 0.5)', '0 0 0px rgba(59, 130, 246, 0)'],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Link 
                to="/student/onboarding" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Complete Profile
                <Zap className="w-5 h-5 ml-2" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Card variants for animation
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'} pt-24 pb-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        {/* Header with dark mode toggle */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}
            >
              Welcome back, <span className="text-primary-500">{profile?.name}</span>!
            </motion.h1>
            <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2 transition-colors duration-300`}>
              Here's what's happening with your internship journey
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Delete Account
            </motion.button>
            <motion.button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full relative overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} transition-colors duration-300`}
              aria-label="Toggle dark mode"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
            {/* Sun rays animation */}
            {darkMode && (
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute top-0 left-1/2 w-1 h-4 bg-yellow-300/40 transform -translate-x-1/2"></div>
                <div className="absolute top-1/2 right-0 w-4 h-1 bg-yellow-300/40 transform -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-1/2 w-1 h-4 bg-yellow-300/40 transform -translate-x-1/2"></div>
                <div className="absolute top-1/2 left-0 w-4 h-1 bg-yellow-300/40 transform -translate-y-1/2"></div>
                <div className="absolute top-1/4 right-1/4 w-1 h-3 bg-yellow-300/40 transform rotate-45"></div>
                <div className="absolute top-1/4 left-1/4 w-1 h-3 bg-yellow-300/40 transform -rotate-45"></div>
                <div className="absolute bottom-1/4 right-1/4 w-1 h-3 bg-yellow-300/40 transform -rotate-45"></div>
                <div className="absolute bottom-1/4 left-1/4 w-1 h-3 bg-yellow-300/40 transform rotate-45"></div>
              </motion.div>
            )}
            
            {/* Sun/Moon icon with rotation */}
            <motion.div
              className="relative z-10"
              animate={{ 
                rotate: darkMode ? 360 : 0,
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 2, repeat: 0 },
                scale: { duration: 2, repeat: Infinity }
              }}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Stats Cards with glowing effect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {[
            {
              icon: <CheckCircle className="w-6 h-6 text-green-600" />,
              bg: 'bg-green-100',
              title: 'Profile Status',
              value: 'Complete',
              color: 'text-green-600',
              darkBg: 'bg-green-900/20'
            },
            {
              icon: <Calendar className="w-6 h-6 text-blue-600" />,
              bg: 'bg-blue-100',
              title: 'Interviews',
              value: interviews.length,
              color: 'text-blue-600',
              darkBg: 'bg-blue-900/20'
            },
            {
              icon: <Bell className="w-6 h-6 text-yellow-600" />,
              bg: 'bg-yellow-100',
              title: 'Notifications',
              value: notifications.filter(n => !n.read).length,
              color: 'text-yellow-600',
              darkBg: 'bg-yellow-900/20'
            },
            {
              icon: <AlertCircle className="w-6 h-6 text-red-600" />,
              bg: 'bg-red-100',
              title: 'Missed Interviews',
              value: missedInterviews.length,
              color: 'text-red-600',
              darkBg: 'bg-red-900/20'
            },
            {
              icon: <User className="w-6 h-6 text-purple-600" />,
              bg: 'bg-purple-100',
              title: 'Experience',
              value: `${profile?.experienceLevel} year${profile?.experienceLevel !== 1 ? 's' : ''}`,
              color: 'text-purple-600',
              darkBg: 'bg-purple-900/20'
            }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-xl p-4 ${darkMode ? stat.darkBg : stat.bg} transition-colors duration-300 overflow-hidden cursor-pointer`}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatCardClick(stat.title)}
            >
              {glowIndex === index && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.3 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-white rounded-xl"
                />
              )}
              <div className="flex items-center z-10 relative">
                <motion.div
                  className={`w-12 h-12 ${darkMode ? 'bg-gray-700/50' : 'bg-white'} rounded-lg flex items-center justify-center shadow-sm transition-colors duration-300`}
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                >
                  {stat.icon}
                </motion.div>
                <div className="ml-4">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>{stat.title}</p>
                  <p className={`text-lg font-semibold ${darkMode ? 'text-white' : stat.color} transition-colors duration-300`}>{stat.value}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5 }}
              className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border transition-colors duration-300`}
              whileHover={{ 
                boxShadow: darkMode 
                  ? '0 0 20px rgba(255, 255, 255, 0.1)' 
                  : '0 0 20px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                  Profile Summary
                </h2>
                <motion.div
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/student/profile" 
                    className={`flex items-center ${darkMode ? 'text-white hover:text-gray-200' : 'text-primary-600 hover:text-primary-700'} transition-colors duration-300`}
                  >
                    <span className="mr-1">View</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    className="relative"
                    animate={{
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                      {profile?.profilePicturePath ? (
                        <img
                          src={makeUploadsUrl(profile.profilePicturePath, 'profile')}
                          alt="Profile"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <Camera className="w-8 h-8 text-gray-400" />
                      )}
                      {/* Fallback div that shows when image fails to load */}
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-full text-white font-bold text-lg" style={{ display: 'none' }}>
                        {profile?.name?.charAt(0)?.toUpperCase() || 'P'}
                      </div>
                    </div>
                    {profile?.profilePicturePath && (
                      <motion.div 
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          rotate: [0, 15, -15, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    )}
                  </motion.div>
                  <div>
                    <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                      {profile?.name}
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                      {profile?.university}
                    </p>
                    <motion.div 
                      className="flex items-center mt-1"
                      animate={{ 
                        x: [0, 2, -2, 0]
                      }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <Briefcase className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'} mr-1`} />
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Looking for {profile?.internshipType || 'internship'}
                      </span>
                    </motion.div>
                  </div>
                </div>

                <div>
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 transition-colors duration-300`}>
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.programmingLanguages?.slice(0, 4).map((lang) => (
                      <motion.span 
                        key={lang}
                        whileHover={{ scale: 1.1 }}
                        className={`px-3 py-1 ${darkMode ? 'bg-gray-700 text-primary-300' : 'bg-primary-100 text-primary-700'} text-sm rounded-full transition-colors duration-300`}
                        animate={{ 
                          scale: [1, 1.05, 1],
                          y: [0, -2, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                      >
                        {lang}
                      </motion.span>
                    ))}
                    {profile?.programmingLanguages?.length > 4 && (
                      <motion.span 
                        className={`px-3 py-1 ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} text-sm rounded-full transition-colors duration-300`}
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        +{profile.programmingLanguages.length - 4} more
                      </motion.span>
                    )}
                  </div>
                </div>

                {profile?.cvPath && (
                  <motion.a
                    href={makeUploadsUrl(profile.cvPath, 'cv')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center mt-2 text-xs px-2 py-1 rounded-md ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    View CV
                  </motion.a>
                )}

                <div>
                  <h4 className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} mb-3 transition-colors duration-300`}>
                    Interests
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {profile?.preferredDomains?.slice(0, 3).map((domain) => (
                      <motion.span 
                        key={domain}
                        whileHover={{ scale: 1.1 }}
                        className={`px-3 py-1 ${darkMode ? 'bg-gray-700 text-green-300' : 'bg-green-100 text-green-700'} text-sm rounded-full transition-colors duration-300`}
                        animate={{ 
                          scale: [1, 1.05, 1],
                          y: [0, -2, 0]
                        }}
                        transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                      >
                        {domain}
                      </motion.span>
                    ))}
                  </div>
                </div>

                {profile?.cvPath && (
                  <motion.a
                    href={`${profile.cvPath.startsWith('/uploads') ? '' : '/uploads'}${profile.cvPath.startsWith('/') ? profile.cvPath : `/${profile.cvPath}`}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center mt-3 text-sm px-3 py-1 rounded-md ${darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    View CV
                  </motion.a>
                )}
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Interviews */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border transition-colors duration-300`}
              whileHover={{ 
                boxShadow: darkMode 
                  ? '0 0 20px rgba(255, 255, 255, 0.1)' 
                  : '0 0 20px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                  Upcoming Interviews
                </h2>
                <motion.div
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link 
                    to="/student/interviews" 
                    className={`flex items-center ${darkMode ? 'text-white hover:text-gray-200' : 'text-primary-600 hover:text-primary-700'} transition-colors duration-300`}
                  >
                    <span className="mr-1">View all</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </div>

              {interviews.length > 0 ? (
                <div className="space-y-4">
                  <AnimatePresence>
                    {interviews.map((interview) => (
                      <motion.div
                        key={interview._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} border transition-colors duration-300`}
                        whileHover={{ 
                          backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.7)' : 'rgba(249, 250, 251, 0.7)',
                          y: -3
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center">
                              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                                {interview.companyName}
                              </h3>
                              {interview.status === 'scheduled' && (
                                <motion.div
                                  animate={{ 
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 10, -10, 0]
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="ml-2"
                                >
                                  <Clock className="w-4 h-4 text-yellow-500" />
                                </motion.div>
                              )}
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                              Round {interview.round} • {new Date(interview.scheduledDate).toLocaleDateString()} at {interview.scheduledTime}
                            </p>
                            <motion.span 
                              className={`inline-block px-3 py-1 text-xs rounded-full mt-2 ${interview.status === 'scheduled' ? (darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700') :
                                interview.status === 'completed' ? (darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700') :
                                  (darkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-100 text-gray-700')
                              } transition-colors duration-300`}
                              animate={{ 
                                scale: [1, 1.05, 1],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                            </motion.span>
                          </div>
                          {interview.status === 'scheduled' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleJoin(interview)}
                              className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-lg shadow hover:shadow-md transition-all duration-300"
                              animate={{
                                boxShadow: [
                                  '0 0 0px rgba(255, 255, 255, 0)',
                                  '0 0 10px rgba(59, 130, 246, 0.5)',
                                  '0 0 0px rgba(255, 255, 255, 0)'
                                ]
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              Join Now
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center py-8 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors duration-300`}
                >
                  <Calendar className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                    No interviews scheduled yet. Complete your profile to start receiving opportunities!
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Recent Notifications */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, delay: 0.3 }}
              className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border transition-colors duration-300`}
              whileHover={{ 
                boxShadow: darkMode 
                  ? '0 0 20px rgba(255, 255, 255, 0.1)' 
                  : '0 0 20px rgba(0, 0, 0, 0.05)'
              }}
            >
              <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6 transition-colors duration-300`}>
                Recent Notifications
              </h2>

              {notifications.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {notifications.map((notification) => (
                      <motion.div
                        key={notification._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        whileHover={{ scale: 1.01 }}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${notification.read ? 
                          (darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200') : 
                          (darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200')
                        } border`}
                        onClick={() => !notification.read && markNotificationAsRead(notification._id)}
                      >
                        <div className="flex items-start space-x-3">
                          <motion.div
                            animate={{ 
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Bell className={`w-5 h-5 mt-0.5 ${notification.read ? 
                              (darkMode ? 'text-gray-500' : 'text-gray-400') : 
                              (darkMode ? 'text-blue-400' : 'text-blue-600')
                            }`} />
                          </motion.div>
                          <div className="flex-1">
                            <p className={`text-sm ${notification.read ? 
                              (darkMode ? 'text-gray-300' : 'text-gray-600') : 
                              (darkMode ? 'text-white' : 'text-gray-900')
                            } font-medium transition-colors duration-300`}>
                              {notification.message}
                            </p>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 transition-colors duration-300`}>
                              {new Date(notification.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="w-2 h-2 bg-blue-500 rounded-full mt-2"
                            />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center py-8 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors duration-300`}
                >
                  <Bell className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
                  <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                    No notifications yet.
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Missed Interviews */}
            {missedInterviews.length > 0 && (
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.4 }}
                className={`rounded-xl shadow-lg p-6 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border transition-colors duration-300`}
                whileHover={{ 
                  boxShadow: darkMode 
                    ? '0 0 20px rgba(255, 255, 255, 0.1)' 
                    : '0 0 20px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                    Missed Interviews
                  </h2>
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <AlertCircle className={`w-6 h-6 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                  </motion.div>
                </div>

                <div className="space-y-4">
                  <AnimatePresence>
                    {missedInterviews.map((interview) => (
                      <motion.div
                        key={interview._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`rounded-lg p-4 ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border transition-colors duration-300`}
                        whileHover={{ 
                          backgroundColor: darkMode ? 'rgba(153, 27, 27, 0.3)' : 'rgba(254, 242, 242, 0.8)',
                          y: -3
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center">
                              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                                {interview.companyName}
                              </h3>
                              <motion.div
                                animate={{ 
                                  scale: [1, 1.1, 1],
                                  rotate: [0, 10, -10, 0]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="ml-2"
                              >
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              </motion.div>
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                              Round {interview.round} • {new Date(interview.scheduledDate).toLocaleDateString()} at {interview.scheduledTime}
                            </p>
                            <motion.span 
                              className={`inline-block px-3 py-1 text-xs rounded-full mt-2 ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'} transition-colors duration-300`}
                              animate={{ 
                                scale: [1, 1.05, 1],
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              {interview.reason === 'expired' ? 'Missed' : interview.reason.charAt(0).toUpperCase() + interview.reason.slice(1)}
                            </motion.span>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 transition-colors duration-300`}>
                              Missed on {new Date(interview.missedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Stat Details Modal */}
      <AnimatePresence>
        {showStatModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeStatModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`relative max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} border transition-colors duration-300`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                  {selectedStat} Details
                </h2>
                <motion.button
                  onClick={closeStatModal}
                  className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors duration-300`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6 text-gray-500" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {selectedStat === 'Profile Status' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <div>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                          Profile Complete
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                          Your profile is fully completed and ready for internship opportunities.
                        </p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-green-50'} transition-colors duration-300`}>
                      <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                        Profile Components:
                      </h4>
                      <ul className={`space-y-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Personal Information
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Profile Picture
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          CV/Resume
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Skills & Experience
                        </li>
                        <li className="flex items-center">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                          Preferred Domains
                        </li>
                      </ul>
                    </div>
                  </div>
                )}

                {selectedStat === 'Interviews' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-8 h-8 text-blue-500" />
                      <div>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                          Active Interviews: {interviews.length}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                          Your upcoming and recent interview schedule.
                        </p>
                      </div>
                    </div>
                    {interviews.length > 0 ? (
                      <div className="space-y-3">
                        {interviews.map((interview, index) => (
                          <motion.div
                            key={interview._id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-blue-50 border-blue-200'} transition-colors duration-300`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                                  {interview.companyName}
                                </h4>
                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                                  Round {interview.round} • {new Date(interview.scheduledDate).toLocaleDateString()} at {interview.scheduledTime}
                                </p>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${interview.status === 'scheduled' ? (darkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700') : (darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700')} transition-colors duration-300`}>
                                  {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                                </span>
                              </div>
                              {interview.status === 'scheduled' && (
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    closeStatModal();
                                    handleJoin(interview);
                                  }}
                                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow hover:shadow-md transition-all duration-300"
                                >
                                  Join Now
                                </motion.button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-8 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors duration-300`}>
                        <Calendar className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                          No active interviews scheduled.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedStat === 'Notifications' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-8 h-8 text-yellow-500" />
                      <div>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                          Unread Notifications: {notifications.filter(n => !n.read).length}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                          Latest updates and important messages.
                        </p>
                      </div>
                    </div>
                    {notifications.length > 0 ? (
                      <div className="space-y-3">
                        {notifications.map((notification, index) => (
                          <motion.div
                            key={notification._id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border cursor-pointer ${notification.read ? 
                              (darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200') : 
                              (darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200')
                            } transition-colors duration-300`}
                            onClick={() => !notification.read && markNotificationAsRead(notification._id)}
                          >
                            <div className="flex items-start space-x-3">
                              <Bell className={`w-5 h-5 mt-0.5 ${notification.read ? 
                                (darkMode ? 'text-gray-500' : 'text-gray-400') : 
                                (darkMode ? 'text-yellow-400' : 'text-yellow-600')
                              }`} />
                              <div className="flex-1">
                                <p className={`text-sm ${notification.read ? 
                                  (darkMode ? 'text-gray-300' : 'text-gray-600') : 
                                  (darkMode ? 'text-white' : 'text-gray-900')
                                } font-medium transition-colors duration-300`}>
                                  {notification.message}
                                </p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 transition-colors duration-300`}>
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              {!notification.read && (
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="w-2 h-2 bg-yellow-500 rounded-full mt-2"
                                />
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-8 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors duration-300`}>
                        <Bell className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                          No notifications yet.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedStat === 'Missed Interviews' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                      <div>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                          Missed Interviews: {missedInterviews.length}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                          Interviews that were automatically cleaned up due to no-show.
                        </p>
                      </div>
                    </div>
                    {missedInterviews.length > 0 ? (
                      <div className="space-y-3">
                        {missedInterviews.map((interview, index) => (
                          <motion.div
                            key={interview._id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} transition-colors duration-300`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="flex items-center">
                                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                                    {interview.companyName}
                                  </h4>
                                  <AlertCircle className="w-4 h-4 text-red-500 ml-2" />
                                </div>
                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                                  Round {interview.round} • {new Date(interview.scheduledDate).toLocaleDateString()} at {interview.scheduledTime}
                                </p>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${darkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'} transition-colors duration-300`}>
                                  {interview.reason === 'expired' ? 'Missed' : interview.reason.charAt(0).toUpperCase() + interview.reason.slice(1)}
                                </span>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 transition-colors duration-300`}>
                                  Missed on {new Date(interview.missedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-8 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors duration-300`}>
                        <AlertCircle className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                          No missed interviews. Great job staying on schedule!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedStat === 'Experience' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-8 h-8 text-purple-500" />
                      <div>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                          Experience Level: {profile?.experienceLevel} year{profile?.experienceLevel !== 1 ? 's' : ''}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                          Your professional experience and skills summary.
                        </p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-purple-50'} transition-colors duration-300`}>
                      <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                        Skills & Expertise:
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <h5 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                            Programming Languages:
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {profile?.programmingLanguages?.map((lang, index) => (
                              <span key={index} className={`px-3 py-1 text-sm rounded-full ${darkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'} transition-colors duration-300`}>
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h5 className={`font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-300`}>
                            Preferred Domains:
                          </h5>
                          <div className="flex flex-wrap gap-2">
                            {profile?.preferredDomains?.map((domain, index) => (
                              <span key={index} className={`px-3 py-1 text-sm rounded-full ${darkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-700'} transition-colors duration-300`}>
                                {domain}
                              </span>
                            ))}
                          </div>
                        </div>
                        {profile?.cvPath && (
                          <div className="flex items-center space-x-2">
                            <FileText className="w-5 h-5 text-blue-500" />
                            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                              CV/Resume uploaded
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default StudentDashboard;