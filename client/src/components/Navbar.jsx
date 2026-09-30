import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Building2, 
  Shield, 
  LogOut, 
  Search, 
  Home,
  UserCircle,
  Briefcase,
  BookOpen,
  BarChart2,
  Mail,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Menu,
  X,
  LayoutGrid,
  Info,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DarkModeToggle from './DarkModeToggle';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  const getNavItems = () => {
    if (!user) return [];
    let items = [];
    switch (user.userType) {
      case 'student':
        items = [
          { path: '/student/dashboard', label: 'Dashboard', icon: Home },
          { path: '/posts', label: 'Posts', icon: Briefcase },
          { path: '/student/profile', label: 'Profile', icon: UserCircle }
        ];
        break;
      case 'company':
        items = [
          { path: '/company/dashboard', label: 'Dashboard', icon: Home },
          { path: '/posts', label: 'Posts', icon: Briefcase },
          { path: '/company/search', label: 'Search Students', icon: Search },
          { path: '/company/internships', label: 'My Internships', icon: Briefcase },
          { path: '/company/analytics', label: 'Analytics', icon: BarChart2 }
        ];
        break;
      case 'admin':
        items = [
          { path: '/admin/dashboard', label: 'Dashboard', icon: Home },
          { path: '/posts', label: 'Posts', icon: Briefcase },
          { path: '/admin/posts', label: 'Manage Posts', icon: BarChart2 },
          { path: '/admin/companies', label: 'Companies', icon: Building2 },
          { path: '/admin/students', label: 'Students', icon: User },
          { path: '/admin/approvals', label: 'Approvals', icon: Shield }
        ];
        break;
      default:
        items = [];
    }
    return items;
  };

  const getUserIcon = () => {
    if (!user) return User;
    switch (user.userType) {
      case 'student': return User;
      case 'company': return Building2;
      case 'admin': return Shield;
      default: return User;
    }
  };

  const UserIcon = getUserIcon();
  const navItems = getNavItems();

  return (
    <motion.nav 
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-sm shadow-md dark:bg-gray-900/95' 
          : 'bg-white/90 backdrop-blur-sm dark:bg-gray-900/90'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div 
              className="w-9 h-9 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center"
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <Search className="w-5 h-5 text-white" />
            </motion.div>
            <motion.span 
              className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Future desk
            </motion.span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {user && navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative py-2 px-3 group"
                  onMouseEnter={() => setHoveredLink(item.path)}
                  onMouseLeave={() => setHoveredLink(null)}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}`} />
                    <span className={`font-medium transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-600 dark:text-gray-300 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}`}>
                      {item.label}
                    </span>
                  </div>
                  
                  {(isActive || hoveredLink === item.path) && (
                    <motion.div 
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-600 dark:bg-indigo-400"
                      layoutId="navbar-active-indicator"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Menu + Bottom Icon Row */}
          <div className="flex items-center space-x-3">
            <div className="hidden sm:flex items-center">
              <DarkModeToggle compact={true} />
            </div>
            {user ? (
              <div className="relative">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <motion.div 
                      className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"
                      animate={{ rotate: [0, 10, 0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    </motion.div>
                    <div className="text-left hidden md:block">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                        {user.name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user.userType}
                      </p>
                    </div>
                  </div>
                  {userMenuOpen ? (
                    <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  )}
                </motion.button>
                
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.email}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Icon row near Sign in */}
                <div className="hidden md:flex items-center gap-4 pr-3 mr-2 border-r border-gray-200 dark:border-gray-700">
                  <Link to="/" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Home className="w-5 h-5 text-indigo-500" />
                  </Link>
                  <Link to="/posts" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <LayoutGrid className="w-5 h-5 text-indigo-500" />
                  </Link>
                  {/* Info icon with popover */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setInfoOpen(!infoOpen)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      aria-haspopup="dialog"
                      aria-expanded={infoOpen}
                      aria-label="Information"
                    >
                      <Info className="w-5 h-5 text-indigo-500" />
                    </button>
                    {infoOpen && (
                      <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">About Future desk</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-3">
                          Find internships, schedule interviews, and manage your profile. Explore the latest opportunities on Posts.
                        </p>
                        <div className="flex items-center justify-between">
                          <Link to="/posts" className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline" onClick={() => setInfoOpen(false)}>
                            Browse Posts
                          </Link>
                          <button
                            type="button"
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            onClick={() => setInfoOpen(false)}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <Link to="/schedule" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <Calendar className="w-5 h-5 text-indigo-500" />
                  </Link>
                  <Link to="/contact" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                    <MessageSquare className="w-5 h-5 text-indigo-500" />
                  </Link>
                </div>
                <Link
                  to="/login"
                  className="flex items-center space-x-1 px-4 py-2 rounded-lg text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span className="font-medium">Sign</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center space-x-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md shadow-indigo-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span className="font-medium">Register</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden flex flex-col items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-800 dark:text-gray-200" />
            ) : (
              <Menu className="w-6 h-6 text-gray-800 dark:text-gray-200" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="px-4 py-5 space-y-4">
              {user ? (
                <>
                  {navItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.path);
                    
                    return (
                      <motion.div
                        key={item.path}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={item.path}
                          className={`flex items-center space-x-3 p-3 rounded-lg ${
                            isActive 
                              ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </motion.div>
                    );
                  })}
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: navItems.length * 0.1 }}
                    className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center px-3 mb-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{user.name || 'User'}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{user.userType}</p>
                      </div>
                      <motion.div 
                        className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"
                        animate={{ rotate: [0, 10, 0, -10, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <UserIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </motion.div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 p-3 text-red-600 w-full rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </motion.div>
                </>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block w-full text-center py-3 px-4 rounded-lg border border-indigo-600 text-indigo-600 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-400"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center py-3 px-4 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-md hover:from-indigo-700 hover:to-purple-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Mobile theme toggle */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
                <DarkModeToggle compact={true} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

export default Navbar;