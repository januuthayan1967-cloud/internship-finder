import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Building,
  Search,
  Filter,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Activity,
  PieChart,
  LineChart,
  Target,
  Award,
  Star,
  CheckCircle,
  AlertCircle,
  Clock as ClockIcon,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Globe,
  Settings,
  MoreHorizontal
} from 'lucide-react';

function CompanyAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalPosts: 0,
    activePosts: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalInterviews: 0,
    completedInterviews: 0,
    upcomingInterviews: 0,
    profileViews: 0,
    averageResponseTime: 0,
    conversionRate: 0
  });
  const [posts, setPosts] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('overview');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [postsRes, interviewsRes] = await Promise.all([
        axios.get('/api/companies/internships'),
        axios.get('/api/companies/interviews')
      ]);

      const posts = postsRes.data;
      const interviews = interviewsRes.data;

      // Calculate analytics
      const totalPosts = posts.length;
      const activePosts = posts.filter(post => post.isActive).length;
      const totalApplications = posts.reduce((sum, post) => sum + (post.applications?.length || 0), 0);
      const pendingApplications = posts.reduce((sum, post) => 
        sum + (post.applications?.filter(app => app.status === 'applied').length || 0), 0);
      const approvedApplications = posts.reduce((sum, post) => 
        sum + (post.applications?.filter(app => app.status === 'selected').length || 0), 0);
      const rejectedApplications = posts.reduce((sum, post) => 
        sum + (post.applications?.filter(app => app.status === 'rejected').length || 0), 0);

      const totalInterviews = interviews.length;
      const completedInterviews = interviews.filter(i => i.status === 'completed').length;
      const upcomingInterviews = interviews.filter(i => i.status === 'scheduled').length;

      // Mock data for demonstration
      const mockAnalytics = {
        totalPosts,
        activePosts,
        totalApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications,
        totalInterviews,
        completedInterviews,
        upcomingInterviews,
        profileViews: Math.floor(Math.random() * 1000) + 500,
        averageResponseTime: Math.floor(Math.random() * 48) + 12,
        conversionRate: Math.floor(Math.random() * 30) + 15
      };

      setAnalytics(mockAnalytics);
      setPosts(posts);
      setInterviews(interviews);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMetricChange = (current, previous) => {
    if (previous === 0) return { value: 100, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(change), isPositive: change >= 0 };
  };

  const metrics = [
    {
      title: 'Total Posts',
      value: analytics.totalPosts,
      icon: Briefcase,
      color: 'from-blue-500 to-cyan-500',
      change: getMetricChange(analytics.totalPosts, analytics.totalPosts - 2)
    },
    {
      title: 'Active Posts',
      value: analytics.activePosts,
      icon: CheckCircle,
      color: 'from-green-500 to-emerald-500',
      change: getMetricChange(analytics.activePosts, analytics.activePosts - 1)
    },
    {
      title: 'Total Applications',
      value: analytics.totalApplications,
      icon: Users,
      color: 'from-purple-500 to-pink-500',
      change: getMetricChange(analytics.totalApplications, analytics.totalApplications - 15)
    },
    {
      title: 'Profile Views',
      value: analytics.profileViews,
      icon: Eye,
      color: 'from-orange-500 to-red-500',
      change: getMetricChange(analytics.profileViews, analytics.profileViews - 50)
    },
    {
      title: 'Conversion Rate',
      value: `${analytics.conversionRate}%`,
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-500',
      change: getMetricChange(analytics.conversionRate, analytics.conversionRate - 5)
    },
    {
      title: 'Avg Response Time',
      value: `${analytics.averageResponseTime}h`,
      icon: Clock,
      color: 'from-yellow-500 to-orange-500',
      change: getMetricChange(analytics.averageResponseTime, analytics.averageResponseTime + 2)
    }
  ];

  const chartData = {
    applications: [
      { month: 'Jan', applied: 45, selected: 12, rejected: 8 },
      { month: 'Feb', applied: 52, selected: 15, rejected: 10 },
      { month: 'Mar', applied: 38, selected: 18, rejected: 6 },
      { month: 'Apr', applied: 61, selected: 22, rejected: 12 },
      { month: 'May', applied: 48, selected: 16, rejected: 9 },
      { month: 'Jun', applied: 55, selected: 20, rejected: 11 }
    ],
    posts: [
      { month: 'Jan', active: 8, inactive: 2 },
      { month: 'Feb', active: 12, inactive: 3 },
      { month: 'Mar', active: 10, inactive: 1 },
      { month: 'Apr', active: 15, inactive: 4 },
      { month: 'May', active: 13, inactive: 2 },
      { month: 'Jun', active: 18, inactive: 3 }
    ]
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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
              <BarChart3 className="w-12 h-12 text-white" />
            </div>
            <motion.p 
              className="mt-4 text-gray-600 dark:text-gray-300"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Loading analytics...
            </motion.p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-24 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track your internship performance and insights
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchAnalyticsData}
              className="p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                if (window.confirm('Are you sure you want to sign out and delete your entire account? This action cannot be undone.')) {
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
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
            >
              Sign Out & Delete Account
            </motion.button>
          </div>
        </motion.div>

        {/* Metrics Grid */}
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/50 p-6"
              whileHover={{ y: -5, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-r ${metric.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <metric.icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-1">
                  {metric.change.isPositive ? (
                    <ArrowUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.change.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {metric.change.value.toFixed(1)}%
                  </span>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {metric.value}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {metric.title}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Applications Chart */}
          <motion.div 
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/50 p-6"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Application Trends
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Applied</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Selected</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {chartData.applications.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center gap-1 mb-2">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(data.applied / 70) * 100}%` }}
                    ></div>
                    <div 
                      className="w-full bg-green-500"
                      style={{ height: `${(data.selected / 70) * 100}%` }}
                    ></div>
                    <div 
                      className="w-full bg-red-500 rounded-b"
                      style={{ height: `${(data.rejected / 70) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Posts Status Chart */}
          <motion.div 
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/50 p-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Posts Status
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Inactive</span>
                </div>
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-2">
              {chartData.posts.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex flex-col items-center gap-1 mb-2">
                    <div 
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${(data.active / 20) * 100}%` }}
                    ></div>
                    <div 
                      className="w-full bg-gray-500 rounded-b"
                      style={{ height: `${(data.inactive / 20) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div 
          className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 dark:border-gray-700/50 p-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 text-sm font-medium">
              View All
            </button>
          </div>
          <div className="space-y-4">
            {interviews.slice(0, 5).map((interview, index) => (
              <motion.div
                key={interview._id || index}
                className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  interview.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30' :
                  interview.status === 'scheduled' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  'bg-yellow-100 dark:bg-yellow-900/30'
                }`}>
                  {interview.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : interview.status === 'scheduled' ? (
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Interview with {interview.studentId?.name || 'Student'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(interview.scheduledDate).toLocaleDateString()} • {interview.scheduledTime}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  interview.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  interview.status === 'scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {interview.status}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 dark:border-gray-700/50 hover:shadow-xl transition-all"
          >
            <Download className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Export Data</p>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 dark:border-gray-700/50 hover:shadow-xl transition-all"
          >
            <Mail className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Send Report</p>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 dark:border-gray-700/50 hover:shadow-xl transition-all"
          >
            <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">Settings</p>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/30 dark:border-gray-700/50 hover:shadow-xl transition-all"
          >
            <MoreHorizontal className="w-6 h-6 text-gray-600 dark:text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-900 dark:text-white">More</p>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

export default CompanyAnalytics; 