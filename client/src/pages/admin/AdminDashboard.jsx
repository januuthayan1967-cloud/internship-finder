import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Moon,
  Sun,
  ChevronDown,
  X,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase
} from 'lucide-react';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [approvedCompanies, setApprovedCompanies] = useState([]);
  const [students, setStudents] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const { isDark: darkMode, toggleTheme: toggleDarkMode } = useTheme();
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [glowIndex, setGlowIndex] = useState(0);
  const [selectedStat, setSelectedStat] = useState(null);
  const [showStatModal, setShowStatModal] = useState(false);
  const [interviewSearchTerm, setInterviewSearchTerm] = useState('');
  const [interviewStatusFilter, setInterviewStatusFilter] = useState('all');
  const [interviewTypeFilter, setInterviewTypeFilter] = useState('all');
  const [showCreateInterviewModal, setShowCreateInterviewModal] = useState(false);
  const [showEditInterviewModal, setShowEditInterviewModal] = useState(false);
  const [showDeleteInterviewModal, setShowDeleteInterviewModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedInterviewIds, setSelectedInterviewIds] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createInterviewForm, setCreateInterviewForm] = useState({
    studentId: '',
    companyId: '',
    scheduledDate: '',
    scheduledTime: '',
    round: 1,
    status: 'scheduled',
    roomId: '',
    notes: '',
    feedback: ''
  });
  const [editInterviewForm, setEditInterviewForm] = useState({});
  const [bulkActionForm, setBulkActionForm] = useState({
    action: 'update',
    updates: {}
  });

  useEffect(() => {
    fetchDashboardData();
    
    // Cycle through stats cards with glowing effect
    const interval = setInterval(() => {
      setGlowIndex((prev) => (prev + 1) % 4);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pendingRes, approvedRes, studentsRes, interviewsRes, reportsRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/companies/pending'),
        axios.get('/api/admin/companies/approved'),
        axios.get('/api/admin/students'),
        axios.get('/api/admin/interviews'),
        axios.get('/api/admin/reports')
      ]);

      setStats(statsRes.data);
      setPendingCompanies(pendingRes.data);
      setApprovedCompanies(approvedRes.data);
      setStudents(studentsRes.data);
      setInterviews(interviewsRes.data.interviews || []);
      setReports(reportsRes.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const approveCompany = async (companyId) => {
    try {
      await axios.put(`/api/admin/companies/${companyId}/approve`);
      toast.success('Company approved successfully!');
      
      // Move company from pending to approved
      const company = pendingCompanies.find(c => c._id === companyId);
      setPendingCompanies(prev => prev.filter(c => c._id !== companyId));
      setApprovedCompanies(prev => [...prev, { ...company, isApproved: true }]);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        companies: {
          ...prev.companies,
          approved: prev.companies.approved + 1,
          pending: prev.companies.pending - 1
        }
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve company');
    }
  };

  const rejectCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to reject this company? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/companies/${companyId}/reject`);
      toast.success('Company rejected and removed');
      
      setPendingCompanies(prev => prev.filter(c => c._id !== companyId));
      
      // Update stats
      setStats(prev => ({
        ...prev,
        companies: {
          ...prev.companies,
          pending: prev.companies.pending - 1,
          total: prev.companies.total - 1
        }
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject company');
    }
  };

  const toggleCompanyExpand = (companyId) => {
    if (expandedCompany === companyId) {
      setExpandedCompany(null);
    } else {
      setExpandedCompany(companyId);
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

  // Filter interviews based on search and filters
  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = 
      interview.student.name.toLowerCase().includes(interviewSearchTerm.toLowerCase()) ||
      interview.student.email.toLowerCase().includes(interviewSearchTerm.toLowerCase()) ||
      interview.company.name.toLowerCase().includes(interviewSearchTerm.toLowerCase()) ||
      interview.company.industry.toLowerCase().includes(interviewSearchTerm.toLowerCase());
    
    const matchesStatus = interviewStatusFilter === 'all' || interview.interview.status === interviewStatusFilter;
    const matchesType = interviewTypeFilter === 'all' || interview.type === interviewTypeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // CRUD Functions for Interviews
  const createInterview = async (formData) => {
    try {
      setIsSubmitting(true);
      const response = await axios.post('/api/admin/interviews', formData);
      toast.success('Interview scheduled successfully!');
      setShowCreateInterviewModal(false);
      setCreateInterviewForm({
        studentId: '',
        companyId: '',
        scheduledDate: '',
        scheduledTime: '',
        round: 1,
        status: 'scheduled',
        roomId: '',
        notes: '',
        feedback: ''
      });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateInterview = async (interviewId, updates) => {
    try {
      setIsSubmitting(true);
      await axios.put(`/api/admin/interviews/${interviewId}`, updates);
      toast.success('Interview updated successfully!');
      setShowEditInterviewModal(false);
      setSelectedInterview(null);
      setEditInterviewForm({});
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteInterview = async (interviewId) => {
    try {
      setIsSubmitting(true);
      await axios.delete(`/api/admin/interviews/${interviewId}`);
      toast.success('Interview deleted successfully!');
      setShowDeleteInterviewModal(false);
      setSelectedInterview(null);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete interview');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bulkUpdateInterviews = async (interviewIds, updates) => {
    try {
      setIsSubmitting(true);
      const response = await axios.put('/api/admin/interviews/bulk/update', {
        interviewIds,
        updates
      });
      toast.success(`${response.data.updatedCount} interviews updated successfully!`);
      setShowBulkActionsModal(false);
      setSelectedInterviewIds([]);
      setBulkActionForm({ action: 'update', updates: {} });
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to bulk update interviews');
    } finally {
      setIsSubmitting(false);
    }
  };

  const bulkDeleteInterviews = async (interviewIds) => {
    try {
      setIsSubmitting(true);
      const response = await axios.delete('/api/admin/interviews/bulk/delete', {
        data: { interviewIds }
      });
      toast.success(`${response.data.deletedCount} interviews deleted successfully!`);
      setShowBulkActionsModal(false);
      setSelectedInterviewIds([]);
      fetchDashboardData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to bulk delete interviews');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateInterview = (e) => {
    e.preventDefault();
    createInterview(createInterviewForm);
  };

  const handleEditInterview = (e) => {
    e.preventDefault();
    updateInterview(selectedInterview.id, editInterviewForm);
  };

  const handleBulkAction = (e) => {
    e.preventDefault();
    if (bulkActionForm.action === 'update') {
      bulkUpdateInterviews(selectedInterviewIds, bulkActionForm.updates);
    } else if (bulkActionForm.action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedInterviewIds.length} interviews? This action cannot be undone.`)) {
        bulkDeleteInterviews(selectedInterviewIds);
      }
    }
  };

  const openEditModal = (interview) => {
    setSelectedInterview(interview);
    setEditInterviewForm({
      status: interview.interview.status,
      round: interview.interview.round,
      scheduledDate: interview.interview.scheduledDate ? new Date(interview.interview.scheduledDate).toISOString().split('T')[0] : '',
      scheduledTime: interview.interview.scheduledTime || '',
      roomId: interview.interview.roomId || '',
      notes: interview.interview.notes || '',
      feedback: interview.interview.feedback || ''
    });
    setShowEditInterviewModal(true);
  };

  const openDeleteModal = (interview) => {
    setSelectedInterview(interview);
    setShowDeleteInterviewModal(true);
  };

  const toggleInterviewSelection = (interviewId) => {
    setSelectedInterviewIds(prev => 
      prev.includes(interviewId) 
        ? prev.filter(id => id !== interviewId)
        : [...prev, interviewId]
    );
  };

  const selectAllInterviews = () => {
    setSelectedInterviewIds(filteredInterviews.map(i => i.id));
  };

  const clearSelection = () => {
    setSelectedInterviewIds([]);
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to sign out and permanently delete this admin account? This action cannot be undone.')) return;
    try {
      await axios.delete('/api/admin/profile');
      localStorage.clear();
      sessionStorage.clear();
      alert('Admin account deleted successfully');
      window.location.href = '/';
    } catch (err) {
      console.error('Admin account deletion error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete admin account');
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-500"
        ></motion.div>
      </div>
    );
  }

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const renderStatsCard = (stat, index) => {
    const isGlowing = glowIndex === index;
    
    return (
      <motion.div
        key={index}
        variants={fadeIn}
        className={`relative rounded-2xl p-5 overflow-hidden cursor-pointer ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-xl`}
        animate={{
          boxShadow: isGlowing 
            ? [
                `0 0 0 0 ${darkMode ? stat.darkColor : stat.color}33`,
                `0 0 20px 10px ${darkMode ? stat.darkColor : stat.color}4D`,
                `0 0 0 0 ${darkMode ? stat.darkColor : stat.color}33`
              ]
            : '0 10px 30px rgba(0,0,0,0.1)'
        }}
        transition={{ 
          duration: 2,
          ease: "easeInOut",
          repeat: isGlowing ? Infinity : 0,
          repeatType: "loop"
        }}
        whileHover={{ y: -5, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleStatCardClick(stat.title)}
      >
        {/* Glowing ring animation */}
        {isGlowing && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              scale: [0.8, 1.1, 1.2]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              repeatType: "loop"
            }}
            style={{
              boxShadow: `0 0 30px 15px ${darkMode ? stat.darkColor : stat.color}`
            }}
          />
        )}
        
        <div className="absolute top-0 left-0 w-full h-1 z-10" style={{ background: stat.color }}></div>
        
        <div className="flex items-center">
          <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
            darkMode ? stat.darkColor : stat.color
          } bg-opacity-20`}>
            {stat.icon}
          </div>
          <div className="ml-4">
            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{stat.title}</p>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
            <p className={`text-xs ${index === 2 ? 'text-yellow-500' : index === 0 ? 'text-blue-500' : index === 1 ? 'text-green-500' : 'text-purple-500'}`}>
              {stat.subtitle}
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderOverview = () => (
    <motion.div 
      className="space-y-8"
      variants={staggerChildren}
      initial="hidden"
      animate="visible"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            icon: <Users className="w-6 h-6" />,
            title: "Total Students",
            value: stats?.students?.total || 0,
            subtitle: `${stats?.students?.profileCompletionRate || 0}% completed profiles`,
            color: "bg-blue-500",
            darkColor: "bg-blue-600",
            delay: 0
          },
          {
            icon: <Building2 className="w-6 h-6" />,
            title: "Total Companies",
            value: stats?.companies?.total || 0,
            subtitle: `${stats?.companies?.approvalRate || 0}% approved`,
            color: "bg-green-500",
            darkColor: "bg-green-600",
            delay: 0.1
          },
          {
            icon: <Clock className="w-6 h-6" />,
            title: "Pending Approval",
            value: stats?.companies?.pending || 0,
            subtitle: "Companies waiting",
            color: "bg-yellow-500",
            darkColor: "bg-yellow-600",
            delay: 0.2
          },
          {
            icon: <Calendar className="w-6 h-6" />,
            title: "Total Interviews",
            value: interviews.length || 0,
            subtitle: `${interviews.filter(i => i.interview.status === 'scheduled').length} scheduled`,
            color: "bg-purple-500",
            darkColor: "bg-purple-600",
            delay: 0.3
          }
        ].map((stat, index) => renderStatsCard(stat, index))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          variants={fadeIn}
          className={`rounded-2xl p-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-xl glow-hover`}
          whileHover={{ 
            y: -5,
            boxShadow: darkMode 
              ? '0 0 25px rgba(59, 130, 246, 0.3)' 
              : '0 0 25px rgba(59, 130, 246, 0.2)'
          }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Recent Students
          </h3>
          <div className="space-y-3">
            {students.slice(0, 5).map((student, index) => (
              <motion.div 
                key={student._id}
                variants={fadeIn}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                } glow-hover`}
                whileHover={{ 
                  y: -3,
                  boxShadow: darkMode 
                    ? '0 0 15px rgba(59, 130, 246, 0.3)' 
                    : '0 0 15px rgba(59, 130, 246, 0.2)'
                }}
              >
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{student.name}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{student.university}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  student.profileCompleted 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {student.profileCompleted ? 'Complete' : 'Incomplete'}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          variants={fadeIn}
          className={`rounded-2xl p-6 ${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } shadow-xl glow-hover`}
          whileHover={{ 
            y: -5,
            boxShadow: darkMode 
              ? '0 0 25px rgba(59, 130, 246, 0.3)' 
              : '0 0 25px rgba(59, 130, 246, 0.2)'
          }}
        >
          <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Pending Companies
          </h3>
          <div className="space-y-3">
            {pendingCompanies.slice(0, 5).map((company, index) => (
              <motion.div 
                key={company._id}
                variants={fadeIn}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  darkMode ? 'bg-gray-700' : 'bg-gray-50'
                } glow-hover`}
                whileHover={{ 
                  y: -3,
                  boxShadow: darkMode 
                    ? '0 0 15px rgba(59, 130, 246, 0.3)' 
                    : '0 0 15px rgba(59, 130, 246, 0.2)'
                }}
              >
                <div>
                  <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{company.name}</p>
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{company.industry}</p>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => approveCompany(company._id)}
                    className={`p-2 rounded-full btn-glow ${
                      darkMode ? 'bg-green-800 text-green-200' : 'bg-green-100 text-green-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => rejectCompany(company._id)}
                    className={`p-2 rounded-full btn-glow ${
                      darkMode ? 'bg-red-800 text-red-200' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );

  const renderPendingCompanies = () => (
    <motion.div 
      variants={fadeIn}
      className={`rounded-2xl p-6 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-xl glow-hover`}
      whileHover={{ 
        boxShadow: darkMode 
          ? '0 0 25px rgba(139, 92, 246, 0.3)' 
          : '0 0 25px rgba(139, 92, 246, 0.2)'
      }}
    >
      <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Pending Company Approvals
      </h2>
      
      {pendingCompanies.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            No companies pending approval
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingCompanies.map((company) => (
            <motion.div
              key={company._id}
              variants={fadeIn}
              className={`border rounded-2xl overflow-hidden ${
                darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
              } glow-hover`}
              whileHover={{ 
                y: -5,
                boxShadow: darkMode 
                  ? '0 0 20px rgba(139, 92, 246, 0.4)' 
                  : '0 0 20px rgba(139, 92, 246, 0.2)'
              }}
            >
              <div 
                className="flex items-start justify-between p-6 cursor-pointer"
                onClick={() => toggleCompanyExpand(company._id)}
              >
                <div className="flex-1">
                  <div className="flex items-center">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {company.name}
                    </h3>
                    <div className="ml-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        darkMode ? 'bg-yellow-900 text-yellow-200' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Pending
                      </span>
                    </div>
                  </div>
                  <p className={`mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {company.industry} • {company.location}
                  </p>
                </div>
                
                <motion.div 
                  animate={{ rotate: expandedCompany === company._id ? 180 : 0 }}
                  className={`ml-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </div>
              
              <AnimatePresence>
                {expandedCompany === company._id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`px-6 pb-6 ${
                      darkMode ? 'bg-gray-800' : 'bg-gray-50'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <strong>Email:</strong> {company.email}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <strong>Industry:</strong> {company.industry}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <strong>Location:</strong> {company.location}
                        </p>
                      </div>
                      <div>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <strong>Size:</strong> {company.size} employees
                        </p>
                        {company.website && (
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            <strong>Website:</strong>{' '}
                            <a 
                              href={company.website} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-primary-600 hover:underline"
                            >
                              {company.website}
                            </a>
                          </p>
                        )}
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <strong>Registered:</strong> {new Date(company.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {company.description && (
                      <div className="mt-4">
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          <strong>Description:</strong>
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-700'} mt-1`}>
                          {company.description}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex space-x-3 mt-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => approveCompany(company._id)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 relative overflow-hidden btn-glow"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                        <span className="shine"></span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => rejectCompany(company._id)}
                        className="flex items-center space-x-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 relative overflow-hidden btn-glow"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                        <span className="shine"></span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderStudents = () => (
    <motion.div 
      variants={fadeIn}
      className={`rounded-2xl p-6 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-xl glow-hover`}
      whileHover={{ 
        boxShadow: darkMode 
          ? '0 0 25px rgba(59, 130, 246, 0.3)' 
          : '0 0 25px rgba(59, 130, 246, 0.2)'
      }}
    >
      <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        All Students
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Student
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                University
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Experience
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Profile Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {students.map((student, index) => (
              <motion.tr 
                key={student._id}
                variants={fadeIn}
                className={`${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} glow-hover`}
                whileHover={{ 
                  backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 1)',
                  boxShadow: darkMode 
                    ? '0 0 15px rgba(59, 130, 246, 0.4)' 
                    : '0 0 15px rgba(59, 130, 246, 0.2)'
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{student.name}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{student.email}</div>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {student.university}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {student.experienceLevel !== undefined ? (
                    student.experienceLevel === 0 ? 'Beginner' : 
                    student.experienceLevel === 10 ? '10+ years' :
                    `${student.experienceLevel} year${student.experienceLevel > 1 ? 's' : ''}`
                  ) : 'Not set'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    student.profileCompleted 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {student.profileCompleted ? 'Complete' : 'Incomplete'}
                  </span>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(student.createdAt).toLocaleDateString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const renderApprovedCompanies = () => (
    <motion.div 
      variants={fadeIn}
      className={`rounded-2xl p-6 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-xl glow-hover`}
      whileHover={{ 
        boxShadow: darkMode 
          ? '0 0 25px rgba(139, 92, 246, 0.3)' 
          : '0 0 25px rgba(139, 92, 246, 0.2)'
      }}
    >
      <h2 className={`text-xl font-semibold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
        Approved Companies
      </h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Industry
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                Approved
              </th>
            </tr>
          </thead>
          <tbody className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            {approvedCompanies.map((company, index) => (
              <motion.tr 
                key={company._id}
                variants={fadeIn}
                className={`${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'} glow-hover`}
                whileHover={{ 
                  backgroundColor: darkMode ? 'rgba(55, 65, 81, 0.5)' : 'rgba(249, 250, 251, 1)',
                  boxShadow: darkMode 
                    ? '0 0 15px rgba(139, 92, 246, 0.4)' 
                    : '0 0 15px rgba(139, 92, 246, 0.2)'
                }}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{company.name}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{company.email}</div>
                  </div>
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {company.industry}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {company.location}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                  {company.size}
                </td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {new Date(company.approvedAt).toLocaleDateString()}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );

  const renderInterviews = () => (
    <motion.div 
      variants={fadeIn}
      className={`rounded-2xl p-6 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-xl glow-hover`}
      whileHover={{ 
        boxShadow: darkMode 
          ? '0 0 25px rgba(59, 130, 246, 0.3)' 
          : '0 0 25px rgba(59, 130, 246, 0.2)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Interview Management
        </h2>
        <div className="flex items-center space-x-4">
          <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Total: {interviews.length} interviews
          </div>
          
          {/* Bulk Actions */}
          {selectedInterviewIds.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedInterviewIds.length} selected
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowBulkActionsModal(true)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Bulk Actions
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearSelection}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
              >
                Clear
              </motion.button>
            </div>
          )}
          
          {/* Create Interview Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateInterviewModal(true)}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Schedule Interview</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchDashboardData}
            className={`p-2 rounded-lg ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
            } transition-colors duration-200`}
            title="Refresh interviews"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </motion.button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className={`mb-6 p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={interviewSearchTerm}
              onChange={(e) => setInterviewSearchTerm(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Status
            </label>
            <select
              value={interviewStatusFilter}
              onChange={(e) => setInterviewStatusFilter(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Type
            </label>
            <select
              value={interviewTypeFilter}
              onChange={(e) => setInterviewTypeFilter(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="company_initiated">Company Initiated</option>
              <option value="student_initiated">Student Initiated</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-4 text-sm text-gray-500">
          Showing {filteredInterviews.length} of {interviews.length} interviews
        </div>
      </div>

      {/* Selection Controls */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={selectAllInterviews}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            Select All
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearSelection}
            className="px-3 py-1 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200"
          >
            Clear Selection
          </motion.button>
        </div>
        
        {selectedInterviewIds.length > 0 && (
          <div className="text-sm text-blue-600 font-medium">
            {selectedInterviewIds.length} interview(s) selected
          </div>
        )}
      </div>
      
      {interviews.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            No interviews scheduled yet
          </p>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-2`}>
            Interviews will appear here when companies and students schedule them
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredInterviews.map((interview, index) => (
            <motion.div
              key={interview.id}
              variants={fadeIn}
              className={`border rounded-2xl overflow-hidden ${
                darkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-white'
              } glow-hover`}
              whileHover={{ 
                y: -3,
                boxShadow: darkMode 
                  ? '0 0 20px rgba(59, 130, 246, 0.4)' 
                  : '0 0 20px rgba(59, 130, 246, 0.2)'
              }}
            >
              <div className="p-6">
                {/* Header with status, type, and selection */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {/* Selection Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedInterviewIds.includes(interview.id)}
                      onChange={() => toggleInterviewSelection(interview.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      interview.interview.status === 'scheduled' 
                        ? 'bg-blue-100 text-blue-800' 
                        : interview.interview.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : interview.interview.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {interview.interview.status.charAt(0).toUpperCase() + interview.interview.status.slice(1)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      interview.type === 'company_initiated' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {interview.type === 'company_initiated' ? 'Company Initiated' : 'Student Initiated'}
                    </span>
                    {interview.interview.round > 1 && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                        Round {interview.interview.round}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Created: {new Date(interview.interview.createdAt).toLocaleDateString()}
                    </div>
                    
                    {/* Action Buttons */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEditModal(interview)}
                      className="p-2 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                      title="Edit Interview"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openDeleteModal(interview)}
                      className="p-2 text-red-600 bg-red-100 rounded-lg hover:bg-red-200 transition-colors duration-200"
                      title="Delete Interview"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                {/* Student and Company Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-4">
                  {/* Student Details */}
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Users className="w-4 h-4 mr-2" />
                      Student Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className={`font-medium w-20 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Name:</span>
                        <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{interview.student.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{interview.student.email}</span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{interview.student.university}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{interview.student.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      <Building2 className="w-4 h-4 mr-2" />
                      Company Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className={`font-medium w-20 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Name:</span>
                        <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>{interview.company.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{interview.company.industry}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{interview.company.location}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interview Details */}
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <h4 className={`font-semibold mb-3 flex items-center ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Interview Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className={`font-medium w-24 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date:</span>
                        <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {interview.interview.scheduledDate 
                            ? new Date(interview.interview.scheduledDate).toLocaleDateString()
                            : 'Not scheduled'
                          }
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`font-medium w-24 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Time:</span>
                        <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {interview.interview.scheduledTime || 'Not scheduled'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className={`font-medium w-24 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Room ID:</span>
                        <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {interview.interview.roomId || 'Not assigned'}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className={`font-medium w-24 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Joined:</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          interview.interview.joined 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {interview.interview.joined ? 'Yes' : 'No'}
                        </span>
                      </div>
                      {interview.interview.joinedAt && (
                        <div className="flex items-center">
                          <span className={`font-medium w-24 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Joined At:</span>
                          <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {new Date(interview.interview.joinedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {interview.interview.feedback && (
                        <div className="flex items-start">
                          <span className={`font-medium w-24 mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Feedback:</span>
                          <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {interview.interview.feedback}
                          </span>
                        </div>
                      )}
                      {interview.interview.notes && (
                        <div className="flex items-start">
                          <span className={`font-medium w-24 mt-1 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Notes:</span>
                          <span className={`${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            {interview.interview.notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    View Profile
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                  >
                    Contact
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );

  const renderReports = () => (
    <motion.div 
      variants={fadeIn}
      className={`rounded-2xl p-6 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-xl glow-hover`}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Company Reports
        </h2>
        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Total: {reports.length} reports
        </div>
      </div>

      {reports.length === 0 ? (
        <div className={`text-center py-10 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          No reports yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Student Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Reason</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Reported At</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className={darkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'}>
              {reports.map((r) => (
                <tr key={r._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{r.companyId?.name || r.companyName}</div>
                    <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{r.companyId?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}">
                    {r.studentId?.name || r.studentName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}">
                    {r.studentId?.email || ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{r.reason}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>{new Date(r.createdAt).toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={async () => {
                        if (!window.confirm('This will delete the reported student\'s account and the report. Continue?')) return;
                        try {
                          await axios.delete(`/api/admin/reports/${r._id}`);
                          setReports(prev => prev.filter(rep => rep._id !== r._id));
                        } catch (err) {
                          console.error('Failed to delete report', err);
                          toast.error(err.response?.data?.message || 'Failed to delete report');
                        }
                      }}
                      className={`px-3 py-1 rounded-lg ${darkMode ? 'bg-red-700 text-white hover:bg-red-600' : 'bg-red-600 text-white hover:bg-red-700'}`}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-gray-50 to-gray-100'} pt-24 pb-8 px-4 sm:px-6 lg:px-8 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Admin Dashboard
            </motion.h1>
            <p className={`mt-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Manage the Internship Finder platform
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteAccount}
              className="px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
            >
              Delete Account
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-full btn-glow ${darkMode ? 'bg-yellow-400/20 text-yellow-300' : 'bg-gray-800/10 text-gray-700'}`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'pending', label: 'Pending Companies', icon: Clock },
              { id: 'companies', label: 'Approved Companies', icon: Building2 },
              { id: 'students', label: 'Students', icon: Users },
              { id: 'interviews', label: 'Interviews', icon: Calendar },
              { id: 'reports', label: 'Reports', icon: Briefcase }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600 active-tab-glow'
                      : `border-transparent ${darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'}`
                  }`}
                  whileHover={{ y: -3 }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'pending' && pendingCompanies.length > 0 && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      darkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
                    }`}>
                      {pendingCompanies.length}
                    </span>
                  )}
                  {tab.id === 'interviews' && interviews.length > 0 && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      darkMode ? 'bg-blue-800 text-blue-100' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {interviews.length}
                    </span>
                  )}
                  {tab.id === 'reports' && reports.length > 0 && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      darkMode ? 'bg-red-800 text-red-100' : 'bg-red-100 text-red-800'
                    }`}>
                      {reports.length}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'pending' && renderPendingCompanies()}
          {activeTab === 'companies' && renderApprovedCompanies()}
          {activeTab === 'students' && renderStudents()}
          {activeTab === 'interviews' && renderInterviews()}
          {activeTab === 'reports' && renderReports()}
        </motion.div>
      </div>

      {/* Glow effect styles */}
      <style jsx global>{`
        .glow-hover:hover {
          box-shadow: 0 0 15px -3px ${darkMode ? 'rgba(59, 130, 246, 0.5)' : 'rgba(59, 130, 246, 0.3)'};
          transition: box-shadow 0.3s ease;
        }
        
        .btn-glow {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .btn-glow:hover {
          box-shadow: 0 0 15px -3px currentColor;
        }
        
        .shine {
          position: absolute;
          top: -50%;
          left: -60%;
          width: 20px;
          height: 200%;
          background: rgba(255,255,255,0.3);
          background: linear-gradient(
            to right,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,0.3) 50%,
            rgba(255,255,255,0) 100%
          );
          transform: rotate(30deg);
          opacity: 0;
          transition: all 0.5s ease-out;
        }
        
        .btn-glow:hover .shine {
          opacity: 1;
          left: 120%;
        }
        
        .active-tab-glow {
          position: relative;
        }
        
        .active-tab-glow::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: currentColor;
          box-shadow: 0 0 10px currentColor;
          animation: tab-glow 2s infinite ease-in-out;
        }
        
        @keyframes tab-glow {
          0% { opacity: 0.3; }
          50% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        
        @media (prefers-reduced-motion: reduce) {
          .shine, .active-tab-glow::after {
            display: none;
          }
        }
      `}</style>

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
                {selectedStat === 'Total Students' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Users className="w-8 h-8 text-blue-500" />
                      <div>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                          Total Students: {stats?.students?.total || 0}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                          Complete overview of all registered students.
                        </p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-blue-50'} transition-colors duration-300`}>
                      <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                        Student Statistics:
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-100'} transition-colors duration-300`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Completed Profiles</p>
                          <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} transition-colors duration-300`}>
                            {stats?.students?.completedProfiles || 0}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-100'} transition-colors duration-300`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Incomplete Profiles</p>
                          <p className={`text-lg font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'} transition-colors duration-300`}>
                            {(stats?.students?.total || 0) - (stats?.students?.completedProfiles || 0)}
                          </p>
                        </div>
                      </div>
                      <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-100'} transition-colors duration-300`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Profile Completion Rate</p>
                        <p className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-700'} transition-colors duration-300`}>
                          {stats?.students?.profileCompletionRate || 0}%
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                        Recent Students:
                      </h4>
                      {students.slice(0, 5).map((student, index) => (
                        <motion.div
                          key={student._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} transition-colors duration-300`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                                {student.name}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                                {student.university}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              student.profileCompleted 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {student.profileCompleted ? 'Complete' : 'Incomplete'}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStat === 'Total Companies' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Building2 className="w-8 h-8 text-green-500" />
                      <div>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                          Total Companies: {stats?.companies?.total || 0}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                          Complete overview of all registered companies.
                        </p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-green-50'} transition-colors duration-300`}>
                      <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                        Company Statistics:
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-100'} transition-colors duration-300`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Approved Companies</p>
                          <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} transition-colors duration-300`}>
                            {stats?.companies?.approved || 0}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-100'} transition-colors duration-300`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Pending Approval</p>
                          <p className={`text-lg font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'} transition-colors duration-300`}>
                            {stats?.companies?.pending || 0}
                          </p>
                        </div>
                      </div>
                      <div className={`mt-4 p-3 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-100'} transition-colors duration-300`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Approval Rate</p>
                        <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} transition-colors duration-300`}>
                          {stats?.companies?.approvalRate || 0}%
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                        Recent Companies:
                      </h4>
                      {approvedCompanies.slice(0, 5).map((company, index) => (
                        <motion.div
                          key={company._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} transition-colors duration-300`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                                {company.name}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                                {company.industry} • {company.location}
                              </p>
                            </div>
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                              Approved
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStat === 'Pending Approval' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-8 h-8 text-yellow-500" />
                      <div>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                          Pending Approval: {stats?.companies?.pending || 0}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                          Companies waiting for admin approval.
                        </p>
                      </div>
                    </div>
                    {pendingCompanies.length > 0 ? (
                      <div className="space-y-3">
                        {pendingCompanies.map((company, index) => (
                          <motion.div
                            key={company._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-4 rounded-lg border ${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} transition-colors duration-300`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                                  {company.name}
                                </h4>
                                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                                  {company.industry} • {company.location}
                                </p>
                                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 transition-colors duration-300`}>
                                  Registered on {new Date(company.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    closeStatModal();
                                    approveCompany(company._id);
                                  }}
                                  className="px-3 py-1 bg-green-500 text-white text-xs rounded-lg"
                                >
                                  Approve
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => {
                                    closeStatModal();
                                    rejectCompany(company._id);
                                  }}
                                  className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg"
                                >
                                  Reject
                                </motion.button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className={`text-center py-8 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} transition-colors duration-300`}>
                        <CheckCircle className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-green-400' : 'text-green-500'} transition-colors duration-300`} />
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                          No companies pending approval. All caught up!
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedStat === 'Approved Companies' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-8 h-8 text-purple-500" />
                      <div>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                          Approved Companies: {stats?.companies?.approved || 0}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                          Companies that have been approved and are active.
                        </p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-purple-50'} transition-colors duration-300`}>
                      <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                        Approval Statistics:
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/20' : 'bg-purple-100'} transition-colors duration-300`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Total Approved</p>
                          <p className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-700'} transition-colors duration-300`}>
                            {stats?.companies?.approved || 0}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-100'} transition-colors duration-300`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Approval Rate</p>
                          <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} transition-colors duration-300`}>
                            {stats?.companies?.approvalRate || 0}%
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                        Recently Approved:
                      </h4>
                      {approvedCompanies.slice(0, 5).map((company, index) => (
                        <motion.div
                          key={company._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} transition-colors duration-300`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                                {company.name}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                                {company.industry} • {company.location}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 transition-colors duration-300`}>
                                Approved on {new Date(company.approvedAt).toLocaleDateString()}
                              </p>
                            </div>
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                              Active
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedStat === 'Total Interviews' && (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-8 h-8 text-purple-500" />
                      <div>
                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                          Total Interviews: {interviews.length || 0}
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                          Complete overview of all scheduled interviews.
                        </p>
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-purple-50'} transition-colors duration-300`}>
                      <h4 className={`font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                        Interview Statistics:
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-blue-900/20' : 'bg-blue-100'} transition-colors duration-300`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Scheduled</p>
                          <p className={`text-lg font-bold ${darkMode ? 'text-blue-400' : 'text-blue-700'} transition-colors duration-300`}>
                            {interviews.filter(i => i.interview.status === 'scheduled').length || 0}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-green-900/20' : 'bg-green-100'} transition-colors duration-300`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Completed</p>
                          <p className={`text-lg font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} transition-colors duration-300`}>
                            {interviews.filter(i => i.interview.status === 'completed').length || 0}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-yellow-900/20' : 'bg-yellow-100'} transition-colors duration-300`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Company Initiated</p>
                          <p className={`text-lg font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-700'} transition-colors duration-300`}>
                            {interviews.filter(i => i.type === 'company_initiated').length || 0}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg ${darkMode ? 'bg-indigo-900/20' : 'bg-indigo-100'} transition-colors duration-300`}>
                          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Student Initiated</p>
                          <p className={`text-lg font-bold ${darkMode ? 'text-indigo-400' : 'text-indigo-700'} transition-colors duration-300`}>
                            {interviews.filter(i => i.type === 'student_initiated').length || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                        Recent Interviews:
                      </h4>
                      {interviews.slice(0, 5).map((interview, index) => (
                        <motion.div
                          key={interview.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-3 rounded-lg border ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} transition-colors duration-300`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'} transition-colors duration-300`}>
                                {interview.student.name} ↔ {interview.company.name}
                              </p>
                              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
                                {interview.interview.scheduledDate 
                                  ? new Date(interview.interview.scheduledDate).toLocaleDateString()
                                  : 'Date not set'
                                } • Round {interview.interview.round}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-1 transition-colors duration-300`}>
                                {interview.type === 'company_initiated' ? 'Company Initiated' : 'Student Initiated'}
                              </p>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              interview.interview.status === 'scheduled' 
                                ? 'bg-blue-100 text-blue-700' 
                                : interview.interview.status === 'completed' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                            }`}>
                              {interview.interview.status.charAt(0).toUpperCase() + interview.interview.status.slice(1)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Interview Modal */}
      <AnimatePresence>
        {showCreateInterviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateInterviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              } border transition-colors duration-300`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Schedule New Interview
                </h2>
                <motion.button
                  onClick={() => setShowCreateInterviewModal(false)}
                  className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6 text-gray-500" />
                </motion.button>
              </div>

              <form onSubmit={handleCreateInterview} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Student ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={createInterviewForm.studentId}
                      onChange={(e) => setCreateInterviewForm(prev => ({ ...prev, studentId: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter student ID"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Company ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={createInterviewForm.companyId}
                      onChange={(e) => setCreateInterviewForm(prev => ({ ...prev, companyId: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter company ID"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Scheduled Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={createInterviewForm.scheduledDate}
                      onChange={(e) => setCreateInterviewForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Scheduled Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={createInterviewForm.scheduledTime}
                      onChange={(e) => setCreateInterviewForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Round
                    </label>
                    <select
                      value={createInterviewForm.round}
                      onChange={(e) => setCreateInterviewForm(prev => ({ ...prev, round: parseInt(e.target.value) }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value={1}>Round 1</option>
                      <option value={2}>Round 2</option>
                      <option value={3}>Round 3</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      value={createInterviewForm.status}
                      onChange={(e) => setCreateInterviewForm(prev => ({ ...prev, status: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Room ID
                    </label>
                    <input
                      type="text"
                      value={createInterviewForm.roomId}
                      onChange={(e) => setCreateInterviewForm(prev => ({ ...prev, roomId: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Video call room ID"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Notes
                    </label>
                    <textarea
                      value={createInterviewForm.notes}
                      onChange={(e) => setCreateInterviewForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    type="button"
                    onClick={() => setShowCreateInterviewModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Interview Modal */}
      <AnimatePresence>
        {showEditInterviewModal && selectedInterview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditInterviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`relative max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              } border transition-colors duration-300`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Edit Interview
                </h2>
                <motion.button
                  onClick={() => setShowEditInterviewModal(false)}
                  className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6 text-gray-500" />
                </motion.button>
              </div>

              <form onSubmit={handleEditInterview} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Student
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedInterview.student.name}
                      className={`w-full px-3 py-2 border rounded-lg bg-gray-100 ${
                        darkMode 
                          ? 'border-gray-600 text-gray-400' 
                          : 'border-gray-300 text-gray-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Company
                    </label>
                    <input
                      type="text"
                      disabled
                      value={selectedInterview.company.name}
                      className={`w-full px-3 py-2 border rounded-lg bg-gray-100 ${
                        darkMode 
                          ? 'border-gray-600 text-gray-400' 
                          : 'border-gray-300 text-gray-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Status
                    </label>
                    <select
                      value={editInterviewForm.status}
                      onChange={(e) => setEditInterviewForm(prev => ({ ...prev, status: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="pending">Pending</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Round
                    </label>
                    <select
                      value={editInterviewForm.round}
                      onChange={(e) => setEditInterviewForm(prev => ({ ...prev, round: parseInt(e.target.value) }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value={1}>Round 1</option>
                      <option value={2}>Round 2</option>
                      <option value={3}>Round 3</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Scheduled Date
                    </label>
                    <input
                      type="date"
                      value={editInterviewForm.scheduledDate}
                      onChange={(e) => setEditInterviewForm(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Scheduled Time
                    </label>
                    <input
                      type="time"
                      value={editInterviewForm.scheduledTime}
                      onChange={(e) => setEditInterviewForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Room ID
                    </label>
                    <input
                      type="text"
                      value={editInterviewForm.roomId}
                      onChange={(e) => setEditInterviewForm(prev => ({ ...prev, roomId: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Video call room ID"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Notes
                    </label>
                    <textarea
                      value={editInterviewForm.notes}
                      onChange={(e) => setEditInterviewForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    type="button"
                    onClick={() => setShowEditInterviewModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSubmitting ? 'Updating...' : 'Update Interview'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Interview Modal */}
      <AnimatePresence>
        {showDeleteInterviewModal && selectedInterview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteInterviewModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`relative max-w-md w-full rounded-xl shadow-2xl ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              } border transition-colors duration-300`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <h3 className={`text-lg font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Delete Interview
                </h3>
                
                <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  Are you sure you want to delete the interview between{' '}
                  <span className="font-medium">{selectedInterview.student.name}</span> and{' '}
                  <span className="font-medium">{selectedInterview.company.name}</span>?
                  This action cannot be undone.
                </p>

                <div className="flex justify-center space-x-3">
                  <motion.button
                    onClick={() => setShowDeleteInterviewModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={() => deleteInterview(selectedInterview.id)}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSubmitting ? 'Deleting...' : 'Delete Interview'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Actions Modal */}
      <AnimatePresence>
        {showBulkActionsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowBulkActionsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className={`relative max-w-2xl w-full rounded-xl shadow-2xl ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              } border transition-colors duration-300`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  Bulk Actions ({selectedInterviewIds.length} interviews)
                </h2>
                <motion.button
                  onClick={() => setShowBulkActionsModal(false)}
                  className={`p-2 rounded-full ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-6 h-6 text-gray-500" />
                </motion.button>
              </div>

              <form onSubmit={handleBulkAction} className="p-6 space-y-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Action Type
                  </label>
                  <select
                    value={bulkActionForm.action}
                    onChange={(e) => setBulkActionForm(prev => ({ ...prev, action: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      darkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="update">Bulk Update</option>
                    <option value="delete">Bulk Delete</option>
                  </select>
                </div>

                {bulkActionForm.action === 'update' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Status
                      </label>
                      <select
                        value={bulkActionForm.updates.status || ''}
                        onChange={(e) => setBulkActionForm(prev => ({ 
                          ...prev, 
                          updates: { ...prev.updates, status: e.target.value } 
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">No change</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Round
                      </label>
                      <select
                        value={bulkActionForm.updates.round || ''}
                        onChange={(e) => setBulkActionForm(prev => ({ 
                          ...prev, 
                          updates: { ...prev.updates, round: e.target.value ? parseInt(e.target.value) : undefined } 
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      >
                        <option value="">No change</option>
                        <option value="1">Round 1</option>
                        <option value="2">Round 2</option>
                        <option value="3">Round 3</option>
                      </select>
                    </div>
                  </div>
                )}

                {bulkActionForm.action === 'delete' && (
                  <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900/20' : 'bg-red-50'} border border-red-200`}>
                    <div className="flex items-center space-x-3">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Warning</h4>
                        <p className="text-sm text-red-700">
                          This will permanently delete {selectedInterviewIds.length} interview(s). This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <motion.button
                    type="button"
                    onClick={() => setShowBulkActionsModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 ${
                      bulkActionForm.action === 'delete' 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSubmitting 
                      ? (bulkActionForm.action === 'delete' ? 'Deleting...' : 'Updating...') 
                      : (bulkActionForm.action === 'delete' ? 'Delete Interviews' : 'Update Interviews')
                    }
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminDashboard;