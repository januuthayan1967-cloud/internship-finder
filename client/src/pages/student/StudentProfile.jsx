import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  GraduationCap, 
  Code, 
  Target, 
  FileText,
  Camera,
  Edit,
  Save,
  X,
  Moon,
  Sun,
  Zap,
  Award,
  Briefcase,
  Star,
  Check
} from 'lucide-react';

function StudentProfile() {
  const { user } = useAuth();
  const { isDark: darkMode, toggleTheme: toggleDarkMode } = useTheme();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [editData, setEditData] = useState({
    name: '',
    phone: '',
    university: '',
    experienceLevel: 0,
    programmingLanguages: [],
    preferredDomains: []
  });

  const programmingLanguages = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 
    'Rust', 'Swift', 'Kotlin', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js'
  ];

  const domains = [
    'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 
    'AI', 'Cybersecurity', 'Cloud Computing', 'DevOps', 'UI/UX Design', 'Game Development'
  ];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/students/profile');
      setProfile(response.data);
      setEditData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        university: response.data.university || '',
        experienceLevel: response.data.experienceLevel || 0,
        programmingLanguages: response.data.programmingLanguages || [],
        preferredDomains: response.data.preferredDomains || []
      });
    } catch (error) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await axios.put('/api/students/profile', editData);
      setProfile(response.data.student);
      setEditing(false);
      
      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
    
    setSaving(false);
  };

  const handleCancel = () => {
    setEditData({
      name: profile.name || '',
      phone: profile.phone || '',
      university: profile.university || '',
      experienceLevel: profile.experienceLevel || 0,
      programmingLanguages: profile.programmingLanguages || [],
      preferredDomains: profile.preferredDomains || []
    });
    setEditing(false);
  };

  const handleLanguageToggle = (language) => {
    setEditData(prev => ({
      ...prev,
      programmingLanguages: prev.programmingLanguages.includes(language)
        ? prev.programmingLanguages.filter(l => l !== language)
        : [...prev.programmingLanguages, language]
    }));
  };

  const handleDomainToggle = (domain) => {
    setEditData(prev => ({
      ...prev,
      preferredDomains: prev.preferredDomains.includes(domain)
        ? prev.preferredDomains.filter(d => d !== domain)
        : [...prev.preferredDomains, domain]
    }));
  };

  // Normalize any stored file path (absolute Windows paths, backslashes, etc.)
  // into a web URL served by Express static: /uploads/<subdir>/<filename>
  const makeUploadsUrl = (rawPath, type) => {
    if (!rawPath) return '';
    try {
      let p = String(rawPath).replace(/\\\\/g, '/').replace(/\\/g, '/');
      const lower = p.toLowerCase();
      // If already has /uploads/, keep that and the rest
      const idx = lower.indexOf('/uploads/');
      if (idx >= 0) return p.slice(idx);
      // If includes known subdirs, rebuild from there
      const subdirs = ['cvs/', 'profiles/', 'documents/', 'certificates/', 'posts/'];
      for (const sub of subdirs) {
        const pos = lower.lastIndexOf(sub);
        if (pos >= 0) return `/uploads/${p.slice(pos)}`;
      }
      // Fallback: use filename and inferred type dir
      const filename = p.split('/').pop();
      const dir = type === 'cv' ? 'cvs' : type === 'profile' ? 'profiles' : '';
      return dir ? `/uploads/${dir}/${filename}` : `/uploads/${filename}`;
    } catch (_) {
      return '';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"
        ></motion.div>
      </div>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'} pt-24 pb-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500 relative overflow-hidden`}>
      {/* Success animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          >
            <div className="bg-green-500 text-white p-6 rounded-full shadow-xl">
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <Check className="w-16 h-16" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}
            >
              My Profile
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mt-2 transition-colors duration-300`}
            >
              Manage your personal information and preferences
            </motion.p>
          </div>
          
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-yellow-400/20 text-yellow-300' : 'bg-gray-800/10 text-gray-700'} transition-colors duration-300`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
            
            {!editing ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setEditing(true)}
                className="btn-primary flex items-center space-x-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl transition-all"
              >
                <Edit className="w-4 h-4" />
                <span>Edit Profile</span>
              </motion.button>
            ) : (
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancel}
                  className="btn-secondary flex items-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  disabled={saving}
                  className={`btn-primary flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all ${
                    saving ? 'opacity-70' : ''
                  }`}
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </motion.button>
              </div>
            )}
          </div>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Profile Picture & Basic Info */}
          <div className="lg:col-span-1">
            <motion.div 
              variants={itemVariants}
              className={`rounded-2xl shadow-xl p-6 ${
                darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-white border-gray-100'
              } border transition-all duration-500`}
              whileHover={{ 
                y: -5,
                boxShadow: darkMode 
                  ? '0 10px 25px rgba(0, 0, 0, 0.2)' 
                  : '0 10px 25px rgba(0, 0, 0, 0.05)'
              }}
            >
              <div className="text-center">
                <motion.div 
                  whileHover={{ scale: 1.03 }}
                  className="relative w-40 h-40 mx-auto mb-4 rounded-full overflow-hidden border-4 border-transparent bg-gradient-to-r from-primary-500 to-purple-500 p-1"
                  animate={{
                    rotate: [0, 2, -2, 0],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden">
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
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-full">
                        <Camera className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {/* Fallback div that shows when image fails to load */}
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center rounded-full text-white font-bold text-2xl" style={{ display: 'none' }}>
                      {profile?.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                  </div>
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
                    className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1"
                  >
                    <Star className="w-5 h-5 text-yellow-800" />
                  </motion.div>
                </motion.div>
                
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                  {profile?.name}
                </h2>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  {profile?.email}
                </p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-center space-x-2">
                    <Phone className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {profile?.phone}
                    </span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <GraduationCap className={`w-5 h-5 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <span className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {profile?.university}
                    </span>
                  </div>
                </div>

                {profile?.cvPath && (
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="mt-6"
                  >
                    <a 
                      href={makeUploadsUrl(profile.cvPath, 'cv') || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:shadow-lg transition-all"
                      onClick={(e) => {
                        if (!profile.cvPath) {
                          e.preventDefault();
                          alert('No CV available');
                        } else {
                          const cvUrl = makeUploadsUrl(profile.cvPath, 'cv');
                          console.log('Opening CV:', cvUrl);
                        }
                      }}
                    >
                      <FileText className="w-4 h-4" />
                      <span>View CV</span>
                    </a>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Detailed Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <motion.div 
              variants={itemVariants}
              className={`rounded-2xl shadow-xl p-6 ${
                darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-white border-gray-100'
              } border transition-all duration-500`}
              whileHover={{ 
                y: -5,
                boxShadow: darkMode 
                  ? '0 10px 25px rgba(0, 0, 0, 0.2)' 
                  : '0 10px 25px rgba(0, 0, 0, 0.05)'
              }}
            >
              <h3 className={`text-lg font-bold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <User className="w-5 h-5 mr-2 text-primary-500" />
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`form-label ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
                  {editing ? (
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className={`input-field ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                  ) : (
                    <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{profile?.name}</p>
                  )}
                </div>

                <div>
                  <label className={`form-label ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
                  {editing ? (
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
                      className={`input-field ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                  ) : (
                    <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{profile?.phone}</p>
                  )}
                </div>

                <div>
                  <label className={`form-label ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                  <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{profile?.email}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>Email cannot be changed</p>
                </div>

                <div>
                  <label className={`form-label ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>University</label>
                  {editing ? (
                    <motion.input
                      whileFocus={{ scale: 1.02 }}
                      type="text"
                      value={editData.university}
                      onChange={(e) => setEditData(prev => ({ ...prev, university: e.target.value }))}
                      className={`input-field ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                  ) : (
                    <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>{profile?.university}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* CV Preview */}
            {profile?.cvPath && (
              <motion.div 
                variants={itemVariants}
                className={`rounded-2xl shadow-xl p-6 ${
                  darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-white border-gray-100'
                } border transition-all duration-500`}
                whileHover={{ 
                  y: -5,
                  boxShadow: darkMode 
                    ? '0 10px 25px rgba(0, 0, 0, 0.2)' 
                    : '0 10px 25px rgba(0, 0, 0, 0.05)'
                }}
              >
                <h3 className={`text-lg font-bold mb-4 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  <FileText className="w-5 h-5 mr-2 text-blue-500" />
                  CV Preview
                </h3>
                <div className="w-full">
                  <object
                    data={makeUploadsUrl(profile.cvPath, 'cv')}
                    type="application/pdf"
                    width="100%"
                    height="600px"
                  >
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Your browser can't display the PDF. 
                      <a
                        href={makeUploadsUrl(profile.cvPath, 'cv')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Open the CV in a new tab
                      </a>.
                    </p>
                  </object>
                </div>
              </motion.div>
            )}

            {/* Experience Level */}
            <motion.div 
              variants={itemVariants}
              className={`rounded-2xl shadow-xl p-6 ${
                darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-white border-gray-100'
              } border transition-all duration-500`}
              whileHover={{ 
                y: -5,
                boxShadow: darkMode 
                  ? '0 10px 25px rgba(0, 0, 0, 0.2)' 
                  : '0 10px 25px rgba(0, 0, 0, 0.05)'
              }}
            >
              <h3 className={`text-lg font-bold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Briefcase className="w-5 h-5 mr-2 text-primary-500" />
                Experience Level
              </h3>

              {editing ? (
                <div className="flex flex-wrap gap-3">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={year}
                      type="button"
                      onClick={() => setEditData(prev => ({ ...prev, experienceLevel: year }))}
                      className={`px-4 py-2 rounded-lg border transition-all duration-200 ${
                        editData.experienceLevel === year
                          ? `border-transparent bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-md ${darkMode ? 'shadow-primary-500/30' : 'shadow-primary-500/20'}`
                          : `border-gray-300 ${darkMode ? 'hover:border-gray-500 bg-gray-700' : 'hover:border-gray-400'}`
                      }`}
                    >
                      {year === 0 ? 'Beginner' : year === 10 ? '10+' : `${year} year${year > 1 ? 's' : ''}`}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center">
                  <div className={`text-5xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    {profile?.experienceLevel === 0 ? '0' : 
                     profile?.experienceLevel === 10 ? '10+' : profile?.experienceLevel}
                  </div>
                  <div className="ml-4">
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      {profile?.experienceLevel === 0 ? 'Beginner' : 
                       profile?.experienceLevel === 10 ? '10+ years experience' :
                       `Year${profile?.experienceLevel > 1 ? 's' : ''} of experience`}
                    </p>
                    <div className="flex mt-1">
                      {[...Array(profile?.experienceLevel > 10 ? 10 : profile?.experienceLevel)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ 
                            scale: [1, 1.2, 1],
                            rotate: [0, 15, -15, 0]
                          }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            delay: i * 0.1
                          }}
                        >
                          <Star className={`w-4 h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'} mr-1`} />
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Programming Languages */}
            <motion.div 
              variants={itemVariants}
              className={`rounded-2xl shadow-xl p-6 ${
                darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-white border-gray-100'
              } border transition-all duration-500`}
              whileHover={{ 
                y: -5,
                boxShadow: darkMode 
                  ? '0 10px 25px rgba(0, 0, 0, 0.2)' 
                  : '0 10px 25px rgba(0, 0, 0, 0.05)'
              }}
            >
              <h3 className={`text-lg font-bold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Code className="w-5 h-5 mr-2 text-primary-500" />
                Programming Languages
              </h3>

              {editing ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {programmingLanguages.map((language) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={language}
                      type="button"
                      onClick={() => handleLanguageToggle(language)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                        editData.programmingLanguages.includes(language)
                          ? `border-transparent bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md ${darkMode ? 'shadow-blue-500/30' : 'shadow-blue-500/20'}`
                          : `border-gray-300 ${darkMode ? 'hover:border-gray-500 bg-gray-700' : 'hover:border-gray-400'}`
                      }`}
                    >
                      {language}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {profile?.programmingLanguages?.map((language) => (
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      key={language} 
                      className={`px-4 py-2 text-sm rounded-lg shadow ${
                        darkMode ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-blue-300' : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700'
                      }`}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        y: [0, -3, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                    >
                      {language}
                    </motion.span>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Preferred Domains */}
            <motion.div 
              variants={itemVariants}
              className={`rounded-2xl shadow-xl p-6 ${
                darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700' : 'bg-white border-gray-100'
              } border transition-all duration-500`}
              whileHover={{ 
                y: -5,
                boxShadow: darkMode 
                  ? '0 10px 25px rgba(0, 0, 0, 0.2)' 
                  : '0 10px 25px rgba(0, 0, 0, 0.05)'
              }}
            >
              <h3 className={`text-lg font-bold mb-6 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <Target className="w-5 h-5 mr-2 text-primary-500" />
                Preferred Domains
              </h3>

              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {domains.map((domain) => (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      key={domain}
                      type="button"
                      onClick={() => handleDomainToggle(domain)}
                      className={`px-3 py-2 rounded-lg border text-sm transition-all duration-200 ${
                        editData.preferredDomains.includes(domain)
                          ? `border-transparent bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md ${darkMode ? 'shadow-green-500/30' : 'shadow-green-500/20'}`
                          : `border-gray-300 ${darkMode ? 'hover:border-gray-500 bg-gray-700' : 'hover:border-gray-400'}`
                      }`}
                    >
                      {domain}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {profile?.preferredDomains?.map((domain) => (
                    <motion.span 
                      whileHover={{ scale: 1.05 }}
                      key={domain} 
                      className={`px-4 py-2 text-sm rounded-lg shadow ${
                        darkMode ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 text-green-300' : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700'
                      }`}
                      animate={{ 
                        scale: [1, 1.1, 1],
                        y: [0, -3, 0]
                      }}
                      transition={{ duration: 2, repeat: Infinity, delay: Math.random() }}
                    >
                      {domain}
                    </motion.span>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default StudentProfile;