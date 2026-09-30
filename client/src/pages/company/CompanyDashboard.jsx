import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from '../../components/FileUpload';
import {
  Search,
  Calendar,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Briefcase,
  Building,
  Globe,
  UserPlus,
  BarChart2,
  ChevronRight,
  Video,
  Mail,
  Sparkles,
  Activity,
  UserCheck,
  BookOpen,
  Zap,
  Plus,
  X
} from 'lucide-react';

function CompanyDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [hoveredAction, setHoveredAction] = useState(null);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    image: '',
    requirements: { experienceLevel: 0, programmingLanguages: [], preferredDomains: [] },
    duration: '',
    stipend: '',
    location: ''
  });
  const [postLoading, setPostLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    industry: '',
    website: '',
    description: '',
    location: '',
    size: ''
  });
  const [selectedStat, setSelectedStat] = useState(null);
  const [showStatModal, setShowStatModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchMyPosts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profileRes, interviewsRes] = await Promise.all([
        axios.get('/api/companies/profile'),
        axios.get('/api/companies/interviews')
      ]);

      setProfile(profileRes.data);
      setInterviews(interviewsRes.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosts = async () => {
    try {
      const res = await axios.get('/api/companies/internships');
      // Only show posts from last 2 days
      const twoDaysAgo = Date.now() - 2 * 24 * 60 * 60 * 1000;
      setPosts(res.data.filter(post => new Date(post.createdAt).getTime() >= twoDaysAgo));
    } catch (err) {
      setPosts([]);
    }
  };

  const handlePostChange = (e) => {
    setNewPost({ ...newPost, [e.target.name]: e.target.value });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setPostLoading(true);
    try {
      await axios.post('/api/companies/internships', newPost);
      setShowPostModal(false);
      setNewPost({
        title: '', description: '', image: '', requirements: { experienceLevel: 0, programmingLanguages: [], preferredDomains: [] }, duration: '', stipend: '', location: ''
      });
      fetchMyPosts();
    } catch (err) {
      // handle error
    } finally {
      setPostLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingId(post._id);
    setEditData({ ...post });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (post) => {
    setActionLoading(true);
    try {
      await axios.put(`/api/companies/internships/${post._id}`, editData);
      setEditingId(null);
      fetchMyPosts();
    } catch (err) {
      console.error('Update error:', err);
      alert(err.response?.data?.message || 'Failed to update post');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (post) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    setActionLoading(true);
    try {
      await axios.delete(`/api/companies/internships/${post._id}`);
      fetchMyPosts();
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setActionLoading(false);
    }
  };

  // Company Profile CRUD Functions
  const handleEditProfile = () => {
    setProfileData({
      name: profile?.name || '',
      industry: profile?.industry || '',
      website: profile?.website || '',
      description: profile?.description || '',
      location: profile?.location || '',
      size: profile?.size || ''
    });
    setShowProfileModal(true);
  };

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const response = await axios.put('/api/companies/profile', profileData);
      setProfile(response.data.company);
      setShowProfileModal(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfilePicture = async (imageUrl) => {
    try {
      await axios.put('/api/companies/profile-picture', { profilePicture: imageUrl });
      setProfile({ ...profile, profilePicture: imageUrl });
      alert('Profile picture updated successfully!');
    } catch (err) {
      console.error('Profile picture update error:', err);
      alert(err.response?.data?.message || 'Failed to update profile picture');
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to deactivate your company profile? This action cannot be undone.')) return;
    try {
      await axios.delete('/api/companies/profile');
      alert('Company profile deactivated successfully');
      // Redirect to logout or home page
      window.location.href = '/';
    } catch (err) {
      console.error('Profile deletion error:', err);
      alert(err.response?.data?.message || 'Failed to deactivate profile');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to sign out and delete your entire account? This action cannot be undone.')) return;
    try {
      // Delete company profile
      await axios.delete('/api/companies/profile');
      // Clear local storage and redirect
      localStorage.clear();
      sessionStorage.clear();
      alert('Account deleted successfully');
      window.location.href = '/';
    } catch (err) {
      console.error('Account deletion error:', err);
      alert(err.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleStatCardClick = (statTitle) => {
    setSelectedStat(statTitle);
    setShowStatModal(true);
  };

  const closeStatModal = () => {
    setShowStatModal(false);
    setSelectedStat(null);
  };

  const openInterviewModal = (interview) => {
    setSelectedInterview(interview);
    setShowInterviewModal(true);
  };

  const closeInterviewModal = () => {
    setShowInterviewModal(false);
    setSelectedInterview(null);
  };

  if (loading) {
    return (
<div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 py-8 px-4 sm:px-6 lg:px-8">

        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="flex flex-col items-center"
        >
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 w-24 h-24 rounded-full flex items-center justify-center">
            <Building className="w-12 h-12 text-white" />
          </div>
          <motion.p 
            className="mt-4 text-gray-600 dark:text-gray-300"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Preparing your dashboard...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Check if company is approved
  if (!profile?.isApproved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8 pt-24">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/50 p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                y: [0, -10, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </motion.div>
            <motion.h2 
              className="text-2xl font-bold text-gray-900 dark:text-white mb-4"
              animate={{ 
                textShadow: ["0 0 0px rgba(245, 158, 11, 0)", "0 0 10px rgba(245, 158, 11, 0.3)", "0 0 0px rgba(245, 158, 11, 0)"],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
              }}
            >
              Awaiting Approval
            </motion.h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
              Your company account is currently under review by our admin team.
              You'll be notified once approved and can start posting internships.
            </p>
            <motion.div 
              className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 max-w-2xl mx-auto"
              animate={{ 
                y: [0, -5, 0],
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">What happens next?</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Our team will review your company details and approve your account within 24-48 hours.
                You'll receive an email notification once approved.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  const upcomingInterviews = interviews.filter(i => i.status === 'scheduled');
  const completedInterviews = interviews.filter(i => i.status === 'completed');
  const pendingInterviews = interviews.filter(i => i.status === 'pending');

  const handleJoin = (interview) => {
    try {
      console.log("hiiiiiiiiiiiii");
      
      navigate(`/company/zehoNew/${interview._id}`);
    } catch (err) {
      console.error("Navigation error", err);
    }
  };

  const reportStudent = async (studentId, interviewId) => {
    try {
      await axios.post('/api/companies/report', { studentId, interviewId, reason: 'Reported from dashboard' });
      alert('report the student');
    } catch (err) {
      console.error('Report API error:', err);
      alert(err.response?.data?.message || 'Failed to report student');
    }
  };

  const stats = [
    { 
      icon: <Calendar className="w-6 h-6" />, 
      title: "Total Interviews", 
      value: interviews.length,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
      glow: "0 0 15px rgba(59, 130, 246, 0.5)"
    },
    { 
      icon: <Clock className="w-6 h-6" />, 
      title: "Upcoming", 
      value: upcomingInterviews.length,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
      glow: "0 0 15px rgba(245, 158, 11, 0.5)"
    },
    { 
      icon: <CheckCircle className="w-6 h-6" />, 
      title: "Completed", 
      value: completedInterviews.length,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
      glow: "0 0 15px rgba(16, 185, 129, 0.5)"
    },
    { 
      icon: <AlertCircle className="w-6 h-6" />, 
      title: "Pending", 
      value: pendingInterviews.length,
      color: "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
      glow: "0 0 15px rgba(139, 92, 246, 0.5)"
    }
  ];

  const quickActions = [
    { 
      icon: <Plus className="w-5 h-5" />, 
      title: "New Post", 
      action: () => setShowPostModal(true),
      color: "from-emerald-500 to-teal-500",
      glow: "0 0 15px rgba(16, 185, 129, 0.5)"
    }
  ];

  const companyInfo = [
    { icon: <Building className="w-5 h-5" />, label: "Industry", value: profile?.industry },
    { icon: <Globe className="w-5 h-5" />, label: "Location", value: profile?.location },
    { icon: <Users className="w-5 h-5" />, label: "Company Size", value: `${profile?.size} employees` },
    ...(profile?.website ? [
      { 
        icon: <Briefcase className="w-5 h-5" />, 
        label: "Website", 
        value: (
          <a 
            href={profile.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            {profile.website}
          </a>
        )
      }
    ] : [])
  ];

  // Glow effects for different status types
  const getGlowByStatus = (status) => {
    switch(status) {
      case 'scheduled': return "0 0 15px rgba(59, 130, 246, 0.5)";
      case 'pending': return "0 0 15px rgba(245, 158, 11, 0.5)";
      case 'completed': return "0 0 15px rgba(16, 185, 129, 0.5)";
      default: return "0 0 15px rgba(0,0,0,0.1)";
    }
  };

  // Determine if the interview time window has passed (defaults to 60 minutes duration)
  const isInterviewTimePassed = (interview) => {
    try {
      if (!interview?.scheduledDate) return false;
      const start = new Date(interview.scheduledDate);
      if (interview?.scheduledTime) {
        const [hoursStr, minutesStr] = String(interview.scheduledTime).split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        if (!Number.isNaN(hours) && !Number.isNaN(minutes)) {
          start.setHours(hours, minutes, 0, 0);
        }
      }
      // Default duration 60 minutes; show Report after meeting window ends
      const durationMinutes = 60;
      const endTime = new Date(start.getTime() + durationMinutes * 60 * 1000);
      return Date.now() > endTime.getTime();
    } catch (_) {
      return false;
    }
  };

  const canJoinInterview = (interview) => {
    try {
      if (!interview?.scheduledDate) return false;
      const start = new Date(interview.scheduledDate);
      if (interview?.scheduledTime) {
        const [h, m] = String(interview.scheduledTime).split(':');
        const hh = parseInt(h, 10); const mm = parseInt(m, 10);
        if (!Number.isNaN(hh) && !Number.isNaN(mm)) start.setHours(hh, mm, 0, 0);
      }
      const openAt = new Date(start.getTime() - 15 * 60 * 1000);
      const closeAt = new Date(start.getTime() + 90 * 60 * 1000);
      const now = Date.now();
      return now >= openAt.getTime() && now <= closeAt.getTime();
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4 sm:px-6 lg:px-8 pt-24">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-10 w-80 h-80 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 right-10 w-96 h-96 bg-indigo-200/20 dark:bg-indigo-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Interview Details Modal */}
        <AnimatePresence>
          {showInterviewModal && selectedInterview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={closeInterviewModal}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Interview Details</h3>
                  <button onClick={closeInterviewModal} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    ✕
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 dark:text-gray-300"><strong>Student:</strong> {selectedInterview.studentId?.name} ({selectedInterview.studentId?.email})</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300"><strong>Date:</strong> {new Date(selectedInterview.scheduledDate).toLocaleDateString()}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300"><strong>Time:</strong> {selectedInterview.scheduledTime}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-300"><strong>Room ID:</strong> {selectedInterview.roomId || 'Not assigned'}</div>
                  <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
                    The interview room opens 15 minutes before the scheduled time.
                  </div>
                </div>
                <div className="mt-5 flex items-center justify-end gap-3">
                  {isInterviewTimePassed(selectedInterview) && !selectedInterview.joined && (
                    <button onClick={() => { reportNoShow(selectedInterview._id); closeInterviewModal(); }} className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200">Report No-Show</button>
                  )}
                  {(isInterviewTimePassed(selectedInterview) || selectedInterview.joined) && (
                    <button onClick={() => { reportStudent(selectedInterview?.studentId?._id, selectedInterview?._id); navigate('/company/interviews'); closeInterviewModal(); }} className="px-3 py-1 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700">Report</button>
                  )}
                  <button onClick={closeInterviewModal} className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Close</button>
                  {canJoinInterview(selectedInterview) && (
                    <button onClick={() => { handleJoin(selectedInterview); closeInterviewModal(); }} className="px-3 py-1 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Join Now</button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Header with enhanced glow */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <motion.h1 
                className="text-3xl font-bold text-gray-900 dark:text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Welcome, <motion.span 
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
                  animate={{
                    textShadow: ["0 0 0px rgba(99, 102, 241, 0)", "0 0 10px rgba(99, 102, 241, 0.3)", "0 0 20px rgba(99, 102, 241, 0.2)", "0 0 0px rgba(99, 102, 241, 0)"],
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {profile?.name}
                </motion.span>!
              </motion.h1>
              <motion.p 
                className="text-gray-600 dark:text-gray-300 mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Manage your internship program and connect with talented students
              </motion.p>
            </div>
            <motion.div 
              className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-xl flex items-center justify-center"
              animate={{
                rotate: [0, 10, 0, -10, 0],
                scale: [1, 1.05, 1],
                boxShadow: ["0 0 0px rgba(99, 102, 241, 0)", "0 0 15px rgba(99, 102, 241, 0.5)", "0 0 0px rgba(99, 102, 241, 0)"]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Building className="w-8 h-8 text-white" />
            </motion.div>
          </div>
        </motion.div>

        {/* Stats Cards with enhanced glow */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/50 p-6 cursor-pointer"
              whileHover={{ 
                y: -10,
                boxShadow: stat.glow,
                scale: 1.02
              }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatCardClick(stat.title)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex items-center">
                <motion.div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}
                  animate={{
                    rotate: [0, 10, 0, -10, 0],
                    boxShadow: ["0 0 0px rgba(0,0,0,0)", stat.glow, "0 0 0px rgba(0,0,0,0)"]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: index * 0.2
                  }}
                >
                  {stat.icon}
                </motion.div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{stat.title}</p>
                  <motion.p 
                    className="text-2xl font-bold text-gray-900 dark:text-white"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    {stat.value}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions & Company Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions with enhanced glow */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/50 p-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-6">
                <motion.div
                  animate={{ 
                    rotate: [0, 15, 0, -15, 0],
                    boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 15px rgba(99, 102, 241, 0.5)", "0 0 0px rgba(0,0,0,0)"]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                >
                  <Zap className="w-5 h-5 text-white" />
                </motion.div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create New Post
                </h2>
              </div>

              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ 
                      y: -5,
                      boxShadow: action.glow
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                  >
                    <button
                      onClick={action.action}
                      className="block relative overflow-hidden rounded-xl p-4 w-full text-left"
                      onMouseEnter={() => setHoveredAction(index)}
                      onMouseLeave={() => setHoveredAction(null)}
                    >
                      {hoveredAction === index && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r opacity-10"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 0.1 }}
                          style={{ background: `linear-gradient(90deg, ${action.color.replace('from-', '').replace('to-', '').replace(/\s/g, ', ')})` }}
                        />
                      )}
                      <div className="relative flex items-center">
                        <div className={`bg-gradient-to-r ${action.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                          {action.icon}
                        </div>
                        <span className="ml-4 font-medium text-gray-900 dark:text-gray-200">{action.title}</span>
                        <motion.div
                          animate={{ 
                            x: hoveredAction === index ? [0, 5, 0] : 0,
                            textShadow: hoveredAction === index ? 
                              ["0 0 0px rgba(0,0,0,0)", "0 0 8px rgba(255,255,255,0.8)", "0 0 0px rgba(0,0,0,0)"] : 
                              "none"
                          }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                          className="ml-auto"
                        >
                          <Plus className="w-5 h-5 text-gray-400" />
                        </motion.div>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Company Info */}
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/50 p-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 10px rgba(99, 102, 241, 0.3)", "0 0 0px rgba(0,0,0,0)"]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                  >
                    <Building className="w-5 h-5 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Company Information
                  </h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditProfile}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Edit Profile
                </motion.button>
              </div>

              <div className="space-y-4">
                {companyInfo.map((info, index) => (
                  <motion.div 
                    key={index} 
                    className="flex items-start"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 10, 0, -10, 0],
                        boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 8px rgba(99, 102, 241, 0.3)", "0 0 0px rgba(0,0,0,0)"]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: index * 0.2
                      }}
                      className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mt-1"
                    >
                      {info.icon}
                    </motion.div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">{info.label}</p>
                      <p className="font-medium text-gray-900 dark:text-white">{info.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Profile Picture Section */}
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-3">
                      {profile?.profilePicture ? (
                        <img 
                          src={profile.profilePicture} 
                          alt="Profile" 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <Building className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Profile Picture</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {profile?.profilePicture ? 'Uploaded' : 'Not set'}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      // Trigger file upload for profile picture
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const formData = new FormData();
                          formData.append('profilePicture', file);
                          try {
                            const response = await axios.post('/api/upload/profile-picture', formData);
                            handleUpdateProfilePicture(response.data.fileUrl || `/uploads/profiles/${response.data.file.filename}`);
                          } catch (err) {
                            console.error('Upload error:', err);
                            alert('Failed to upload profile picture');
                          }
                        }
                      };
                      input.click();
                    }}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Update
                  </motion.button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-6 pt-4 border-t border-red-200 dark:border-red-800">
                <h3 className="text-sm font-medium text-red-700 dark:text-red-300 mb-2">Danger Zone</h3>
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteProfile}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Deactivate Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteAccount}
                    className="px-3 py-1 text-sm bg-red-800 text-white rounded-lg hover:bg-red-900 w-full"
                  >
                    Sign Out & Delete Account
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Interviews */}
          <div className="lg:col-span-2">
            <motion.div 
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/50 p-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
                <div className="flex items-center">
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 10px rgba(99, 102, 241, 0.3)", "0 0 0px rgba(0,0,0,0)"]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                  >
                    <Calendar className="w-5 h-5 text-white" />
                  </motion.div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Interview Schedule</h2>
                </div>
                
                <div className="flex mt-3 sm:mt-0">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-l-lg text-sm font-medium ${
                      activeTab === 'upcoming' 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('upcoming')}
                    animate={activeTab === 'upcoming' ? {
                      boxShadow: ["0 0 0px rgba(59, 130, 246, 0)", "0 0 10px rgba(59, 130, 246, 0.5)", "0 0 0px rgba(59, 130, 246, 0)"]
                    } : {}}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Upcoming
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 text-sm font-medium ${
                      activeTab === 'pending' 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('pending')}
                    animate={activeTab === 'pending' ? {
                      boxShadow: ["0 0 0px rgba(245, 158, 11, 0)", "0 0 10px rgba(245, 158, 11, 0.5)", "0 0 0px rgba(245, 158, 11, 0)"]
                    } : {}}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Pending
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`px-4 py-2 rounded-r-lg text-sm font-medium ${
                      activeTab === 'completed' 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                    onClick={() => setActiveTab('completed')}
                    animate={activeTab === 'completed' ? {
                      boxShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 10px rgba(16, 185, 129, 0.5)", "0 0 0px rgba(16, 185, 129, 0)"]
                    } : {}}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    Completed
                  </motion.button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'upcoming' && upcomingInterviews.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingInterviews.map((interview) => (
                        <motion.div 
                          key={interview._id} 
                          className="border border-gray-200 dark:border-gray-700 rounded-xl p-5"
                          whileHover={{ 
                            y: -5,
                            boxShadow: getGlowByStatus(interview.status)
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <motion.div 
                                  className="bg-gradient-to-r from-indigo-500 to-purple-500 w-16 h-16 rounded-xl flex items-center justify-center"
                                  animate={{
                                    rotate: [0, 5, 0, -5, 0],
                                    boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 10px rgba(99, 102, 241, 0.3)", "0 0 0px rgba(0,0,0,0)"]
                                  }}
                                  transition={{ 
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                >
                                  <UserCheck className="w-8 h-8 text-white" />
                                </motion.div>
                                <div className="ml-4">
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {interview.studentId?.name || 'Student'}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {interview.studentId?.email}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {new Date(interview.scheduledDate).toLocaleDateString()} • {interview.scheduledTime}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 sm:mt-0 text-right">
                              <span className="inline-block px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                Round {interview.round}
                              </span>

                              <div className="mt-3 flex items-center justify-end gap-3">
                                {!(isInterviewTimePassed(interview) || interview.joined) && (
                                  <motion.button 
                                    onClick={() => canJoinInterview(interview) ? handleJoin(interview) : openInterviewModal(interview)} 
                                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-white dark:hover:text-gray-200"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    animate={{
                                      textShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 8px rgba(99, 102, 241, 0.5)", "0 0 0px rgba(0,0,0,0)"]
                                    }}
                                    transition={{ 
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                    }}
                                  >
                                    <Video className="w-4 h-4 mr-1" />
                                    Join Interview
                                  </motion.button>
                                )}
                                {isInterviewTimePassed(interview) && !interview.joined && (
                                  <motion.button
                                    onClick={() => reportNoShow(interview._id)}
                                    className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Report No-Show
                                  </motion.button>
                                )}
                                {(interview.joined || isInterviewTimePassed(interview)) && (
                                  <motion.button 
                                    onClick={() => { reportStudent(interview?.studentId?._id, interview?._id); navigate('/company/interviews'); }}
                                    className="px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    Report
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : activeTab === 'pending' && pendingInterviews.length > 0 ? (
                    <div className="space-y-4">
                      {pendingInterviews.map((interview) => (
                        <motion.div 
                          key={interview._id} 
                          className="border border-gray-200 dark:border-gray-700 rounded-xl p-5"
                          whileHover={{ 
                            y: -5,
                            boxShadow: getGlowByStatus(interview.status)
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <motion.div 
                                  className="bg-gradient-to-r from-amber-500 to-orange-500 w-16 h-16 rounded-xl flex items-center justify-center"
                                  animate={{
                                    rotate: [0, 5, 0, -5, 0],
                                    boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 10px rgba(245, 158, 11, 0.3)", "0 0 0px rgba(0,0,0,0)"]
                                  }}
                                  transition={{ 
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                >
                                  <Clock className="w-8 h-8 text-white" />
                                </motion.div>
                                <div className="ml-4">
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {interview.studentId?.name || 'Student'}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {interview.studentId?.email}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    Awaiting student confirmation
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 sm:mt-0 text-right">
                              <span className="inline-block px-3 py-1 text-xs rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                Round {interview.round}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : activeTab === 'completed' && completedInterviews.length > 0 ? (
                    <div className="space-y-4">
                      {completedInterviews.map((interview) => (
                        <motion.div 
                          key={interview._id} 
                          className="border border-gray-200 dark:border-gray-700 rounded-xl p-5"
                          whileHover={{ 
                            y: -5,
                            boxShadow: getGlowByStatus(interview.status)
                          }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <motion.div 
                                  className="bg-gradient-to-r from-emerald-500 to-teal-500 w-16 h-16 rounded-xl flex items-center justify-center"
                                  animate={{
                                    rotate: [0, 5, 0, -5, 0],
                                    boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 10px rgba(16, 185, 129, 0.3)", "0 0 0px rgba(0,0,0,0)"]
                                  }}
                                  transition={{ 
                                    duration: 4,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                >
                                  <CheckCircle className="w-8 h-8 text-white" />
                                </motion.div>
                                <div className="ml-4">
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {interview.studentId?.name || 'Student'}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    {interview.studentId?.email}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {new Date(interview.scheduledDate).toLocaleDateString()} • {interview.scheduledTime}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 sm:mt-0 text-right">
                              <span className="inline-block px-3 py-1 text-xs rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                Completed
                              </span>
                              <div className="mt-3">
                                <button className="text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200">
                                  View Feedback
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div 
                      className="text-center py-12"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <motion.div
                        animate={{ 
                          rotate: [0, 15, 0, -15, 0],
                          y: [0, -10, 0],
                          boxShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 15px rgba(99, 102, 241, 0.3)", "0 0 0px rgba(0,0,0,0)"]
                        }}
                        transition={{ 
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4"
                      >
                        <Calendar className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                      </motion.div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        No {activeTab} interviews
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        {activeTab === 'upcoming' 
                          ? "You don't have any upcoming interviews. Schedule one to get started." 
                          : activeTab === 'pending'
                          ? "No pending interview confirmations at this time."
                          : "You haven't completed any interviews yet."}
                      </p>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="mt-4"
                        animate={{
                          boxShadow: ["0 0 0px rgba(99, 102, 241, 0)", "0 0 15px rgba(99, 102, 241, 0.3)", "0 0 0px rgba(0,0,0,0)"]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Link 
                          to="/company/search" 
                          className="inline-flex items-center bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg"
                        >
                          <Search className="w-4 h-4 mr-1" />
                          Search students
                        </Link>
                      </motion.div>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>

              {interviews.length > 0 && (
                <div className="mt-6 text-right">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                  >
                    <Link 
                      to="/company/interviews" 
                      className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 dark:text-white dark:hover:text-gray-200"
                    >
                      View all interviews
                      <motion.div
                        animate={{
                          x: [0, 5, 0],
                          textShadow: ["0 0 0px rgba(0,0,0,0)", "0 0 8px rgba(99, 102, 241, 0.5)", "0 0 0px rgba(0,0,0,0)"]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="ml-1"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </motion.div>
                    </Link>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
        {/* My Internship Posts Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Internship Posts</h2>
            <button
              className="flex items-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg shadow hover:scale-105 transition"
              onClick={() => setShowPostModal(true)}
            >
              <Plus className="w-5 h-5 mr-1" /> New Post
            </button>
          </div>
          {posts.length === 0 ? (
            <div className="text-gray-500 dark:text-gray-400">No active posts (last 2 days).</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {posts.map(post => (
                <div key={post._id} className="bg-white/80 dark:bg-gray-800/80 rounded-xl shadow p-4 border border-gray-200 dark:border-gray-700">
                  {editingId === post._id ? (
                    <>
                      <input name="title" value={editData.title} onChange={handleEditChange} className="w-full mb-2 p-2 rounded border" />
                      <textarea name="description" value={editData.description} onChange={handleEditChange} className="w-full mb-2 p-2 rounded border" />
                      <input name="location" value={editData.location} onChange={handleEditChange} className="w-full mb-2 p-2 rounded border" />
                      <input name="duration" value={editData.duration} onChange={handleEditChange} className="w-full mb-2 p-2 rounded border" />
                      <input name="stipend" value={editData.stipend} onChange={handleEditChange} className="w-full mb-2 p-2 rounded border" />
                      
                      {/* Image upload for editing */}
                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Update Image (Optional)
                        </label>
                        <FileUpload
                          endpoint="/api/upload/post-image"
                          acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif']}
                          maxSize={5 * 1024 * 1024} // 5MB
                          fieldName="postImage"
                          label="Upload New Image"
                          description="Replace the current image"
                          onUploadSuccess={(data) => {
                            const imageUrl = data.fileUrl || `/uploads/posts/${data.file.filename}`;
                            console.log('Upload success, image URL:', imageUrl);
                            setEditData({ ...editData, image: imageUrl });
                          }}
                          onUploadError={(error) => {
                            console.error('Upload error:', error);
                          }}
                        />
                      </div>
                      
                      {/* Show current image if exists */}
                      {editData.image && (
                        <div className="mt-3">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Current Image
                          </label>
                          <div className="relative">
                            <img 
                              src={editData.image}
                              alt="Current post image" 
                              className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                              onError={(e) => {
                                console.error('Image failed to load:', editData.image);
                                e.target.style.display = 'none';
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => setEditData({ ...editData, image: '' })}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleUpdate(post)} disabled={actionLoading} className="px-4 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-700">{actionLoading ? 'Saving...' : 'Save'}</button>
                        <button onClick={() => setEditingId(null)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      {post.image && (
                        <div className="mb-3">
                          <img 
                            src={post.image}
                            alt={post.title} 
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              console.error('Image failed to load:', post.image);
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{post.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-2">{post.description}</p>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Location: {post.location}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Duration: {post.duration}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Stipend: {post.stipend || 'N/A'}</div>
                      <div className="text-xs text-gray-400 mt-2">Posted: {new Date(post.createdAt).toLocaleString()}</div>
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleEdit(post)} className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700">Edit</button>
                        <button onClick={() => handleDelete(post)} disabled={actionLoading} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Post Creation Modal */}
        {showPostModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <form onSubmit={handleCreatePost} className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Create Internship Post</h3>
              
              <div className="space-y-4">
                <input 
                  name="title" 
                  value={newPost.title} 
                  onChange={handlePostChange} 
                  required 
                  placeholder="Title" 
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                />
                
                <textarea 
                  name="description" 
                  value={newPost.description} 
                  onChange={handlePostChange} 
                  required 
                  placeholder="Description" 
                  rows="4"
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                />
                
                <input 
                  name="location" 
                  value={newPost.location} 
                  onChange={handlePostChange} 
                  required 
                  placeholder="Location" 
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                />
                
                <input 
                  name="duration" 
                  value={newPost.duration} 
                  onChange={handlePostChange} 
                  required 
                  placeholder="Duration" 
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                />
                
                <input 
                  name="stipend" 
                  value={newPost.stipend} 
                  onChange={handlePostChange} 
                  placeholder="Stipend (optional)" 
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                />
                
                {/* Photo Upload Section */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Post Image (Optional)
                  </label>
                                     <FileUpload
                     endpoint="/api/upload/post-image"
                     acceptedTypes={['image/jpeg', 'image/jpg', 'image/png', 'image/gif']}
                     maxSize={5 * 1024 * 1024} // 5MB
                     fieldName="postImage"
                     label="Upload Post Image"
                     description="Add an image to make your post more attractive"
                     onUploadSuccess={(data) => {
                       const imageUrl = data.fileUrl || `/uploads/posts/${data.file.filename}`;
                       console.log('Upload success, image URL:', imageUrl);
                       setNewPost({ ...newPost, image: imageUrl });
                     }}
                     onUploadError={(error) => {
                       console.error('Upload error:', error);
                     }}
                   />
                </div>
                
                {/* Preview uploaded image */}
                {newPost.image && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image Preview
                    </label>
                    <div className="relative">
                      <img 
                        src={newPost.image}
                        alt="Post preview" 
                        className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                        onError={(e) => {
                          console.error('Image failed to load:', newPost.image);
                          e.target.style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewPost({ ...newPost, image: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowPostModal(false)} 
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={postLoading} 
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  {postLoading ? 'Posting...' : 'Post'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Company Profile Edit Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Edit Company Profile</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Name *
                  </label>
                  <input 
                    name="name" 
                    value={profileData.name} 
                    onChange={handleProfileChange} 
                    required 
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry *
                  </label>
                  <input 
                    name="industry" 
                    value={profileData.industry} 
                    onChange={handleProfileChange} 
                    required 
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Website
                  </label>
                  <input 
                    name="website" 
                    value={profileData.website} 
                    onChange={handleProfileChange} 
                    type="url"
                    placeholder="https://example.com"
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea 
                    name="description" 
                    value={profileData.description} 
                    onChange={handleProfileChange} 
                    rows="3"
                    maxLength="500"
                    placeholder="Brief description of your company..."
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  />
                  <p className="text-xs text-gray-500 mt-1">{profileData.description.length}/500 characters</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location *
                  </label>
                  <input 
                    name="location" 
                    value={profileData.location} 
                    onChange={handleProfileChange} 
                    required 
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Size *
                  </label>
                  <select 
                    name="size" 
                    value={profileData.size} 
                    onChange={handleProfileChange} 
                    required 
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setShowProfileModal(false)} 
                  className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={profileLoading} 
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {profileLoading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </div>
        )}

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
                className={`relative max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl shadow-2xl bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 border transition-colors duration-300`}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className={`text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300`}>
                    {selectedStat} Details
                  </h2>
                  <motion.button
                    onClick={closeStatModal}
                    className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </motion.button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {selectedStat === 'Total Interviews' && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Calendar className="w-8 h-8 text-blue-500" />
                        <div>
                                                     <h3 className={`text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300`}>
                             Total Interviews: {interviews.length}
                           </h3>
                           <p className={`text-gray-600 dark:text-gray-300 transition-colors duration-300`}>
                            Complete overview of all your interview activities.
                          </p>
                        </div>
                      </div>
                                             <div className={`p-4 rounded-lg bg-blue-50 dark:bg-gray-700/50 transition-colors duration-300`}>
                         <h4 className={`font-semibold mb-3 text-gray-900 dark:text-white transition-colors duration-300`}>
                          Interview Statistics:
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                                                     <div className={`p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20 transition-colors duration-300`}>
                             <p className={`text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300`}>Upcoming</p>
                             <p className={`text-lg font-bold text-amber-700 dark:text-amber-400 transition-colors duration-300`}>
                              {upcomingInterviews.length}
                            </p>
                          </div>
                                                     <div className={`p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 transition-colors duration-300`}>
                             <p className={`text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300`}>Completed</p>
                             <p className={`text-lg font-bold text-emerald-700 dark:text-emerald-400 transition-colors duration-300`}>
                               {completedInterviews.length}
                             </p>
                           </div>
                           <div className={`p-3 rounded-lg bg-violet-100 dark:bg-violet-900/20 transition-colors duration-300`}>
                             <p className={`text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300`}>Pending</p>
                             <p className={`text-lg font-bold text-violet-700 dark:text-violet-400 transition-colors duration-300`}>
                               {pendingInterviews.length}
                             </p>
                           </div>
                           <div className={`p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20 transition-colors duration-300`}>
                             <p className={`text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300`}>Success Rate</p>
                             <p className={`text-lg font-bold text-blue-700 dark:text-blue-400 transition-colors duration-300`}>
                              {interviews.length > 0 ? Math.round((completedInterviews.length / interviews.length) * 100) : 0}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedStat === 'Upcoming' && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-8 h-8 text-amber-500" />
                        <div>
                                                   <h3 className={`text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300`}>
                           Upcoming Interviews: {upcomingInterviews.length}
                         </h3>
                         <p className={`text-gray-600 dark:text-gray-300 transition-colors duration-300`}>
                            Scheduled interviews that are ready to be conducted.
                          </p>
                        </div>
                      </div>
                      {upcomingInterviews.length > 0 ? (
                        <div className="space-y-3">
                          {upcomingInterviews.map((interview, index) => (
                            <motion.div
                              key={interview._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                                                             className={`p-4 rounded-lg border bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 transition-colors duration-300`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className={`font-semibold text-gray-900 dark:text-white transition-colors duration-300`}>
                                    {interview.studentId?.name || 'Student'}
                                  </h4>
                                  <p className={`text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300`}>
                                    {interview.studentId?.email}
                                  </p>
                                  <p className={`text-sm text-gray-500 dark:text-gray-400 mt-1 transition-colors duration-300`}>
                                    {new Date(interview.scheduledDate).toLocaleDateString()} • {interview.scheduledTime}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-block px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 transition-colors duration-300`}>
                                    Round {interview.round}
                                  </span>
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                      closeStatModal();
                                      handleJoin(interview);
                                    }}
                                    className="block mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-lg"
                                  >
                                    Join Now
                                  </motion.button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className={`text-center py-8 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition-colors duration-300`}>
                          <Clock className={`w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500 transition-colors duration-300`} />
                          <p className={`text-gray-600 dark:text-gray-300 transition-colors duration-300`}>
                            No upcoming interviews scheduled.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedStat === 'Completed' && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                        <div>
                          <h3 className={`text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300`}>
                            Completed Interviews: {completedInterviews.length}
                          </h3>
                          <p className={`text-gray-600 dark:text-gray-300 transition-colors duration-300`}>
                            Successfully conducted interviews with feedback.
                          </p>
                        </div>
                      </div>
                      {completedInterviews.length > 0 ? (
                        <div className="space-y-3">
                          {completedInterviews.map((interview, index) => (
                            <motion.div
                              key={interview._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`p-4 rounded-lg border bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 transition-colors duration-300`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                                    {interview.studentId?.name || 'Student'}
                                  </h4>
                                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                                    {interview.studentId?.email}
                                  </p>
                                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 transition-colors duration-300`}>
                                    Completed on {new Date(interview.scheduledDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-block px-2 py-1 text-xs rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 transition-colors duration-300`}>
                                    Completed
                                  </span>
                                  <button className="block mt-2 px-3 py-1 bg-emerald-500 text-white text-xs rounded-lg">
                                    View Feedback
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className={`text-center py-8 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors duration-300`}>
                          <CheckCircle className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-300`} />
                          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                            No completed interviews yet.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedStat === 'Pending' && (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <AlertCircle className="w-8 h-8 text-violet-500" />
                        <div>
                          <h3 className={`text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300`}>
                            Pending Interviews: {pendingInterviews.length}
                          </h3>
                          <p className={`text-gray-600 dark:text-gray-300 transition-colors duration-300`}>
                            Interviews awaiting student confirmation.
                          </p>
                        </div>
                      </div>
                      {pendingInterviews.length > 0 ? (
                        <div className="space-y-3">
                          {pendingInterviews.map((interview, index) => (
                            <motion.div
                              key={interview._id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`p-4 rounded-lg border bg-violet-50 border-violet-200 dark:bg-violet-900/20 dark:border-violet-800 transition-colors duration-300`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                                    {interview.studentId?.name || 'Student'}
                                  </h4>
                                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                                    {interview.studentId?.email}
                                  </p>
                                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 transition-colors duration-300`}>
                                    Awaiting student confirmation
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className={`inline-block px-2 py-1 text-xs rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 transition-colors duration-300`}>
                                    Round {interview.round}
                                  </span>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className={`text-center py-8 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition-colors duration-300`}>
                          <AlertCircle className={`w-12 h-12 mx-auto mb-4 text-gray-400 dark:text-gray-500 transition-colors duration-300`} />
                          <p className={`text-gray-600 dark:text-gray-300 transition-colors duration-300`}>
                            No pending interviews at this time.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CompanyDashboard;