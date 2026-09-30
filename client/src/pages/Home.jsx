import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Search, 
  Users, 
  Building2, 
  CheckCircle, 
  ArrowRight,
  BarChart2,
  Calendar,
  FileText,
  UserPlus,
  Briefcase,
  Star,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import DarkModeToggle from '../components/DarkModeToggle';
import InternshipImage from '../assets/internship-illustration.png';

// Custom hook to replace react-intersection-observer
const useViewportDetection = (options = {}) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options]);
  
  return [ref, isInView];
};

// Bubble Pop Effect Component
const BubblePop = () => {
  const [bubbles, setBubbles] = useState([]);
  
  useEffect(() => {
    const createBubble = () => {
      const size = Math.random() * 30 + 10;
      const newBubble = {
        id: Date.now(),
        size,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 3 + 2
      };
      setBubbles(prev => [...prev, newBubble]);
      
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => b.id !== newBubble.id));
      }, newBubble.duration * 1000);
    };
    
    const interval = setInterval(createBubble, 500);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {bubbles.map(bubble => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full bg-gradient-to-br from-indigo-300/30 to-purple-400/30 dark:from-indigo-600/30 dark:to-purple-600/30 backdrop-blur-sm"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.x}%`,
            top: `${bubble.y}%`,
          }}
          initial={{ 
            opacity: 0, 
            scale: 0,
            boxShadow: "0 0 0 rgba(99, 102, 241, 0)"
          }}
          animate={{ 
            opacity: 1,
            scale: 1,
            boxShadow: "0 0 15px rgba(99, 102, 241, 0.5)"
          }}
          transition={{ 
            duration: bubble.duration * 0.2,
            ease: "easeOut"
          }}
          exit={{ 
            opacity: 0,
            scale: 1.5,
            boxShadow: "0 0 30px rgba(99, 102, 241, 0.8)"
          }}
        />
      ))}
    </div>
  );
};

// Glowing Button Component
const GlowButton = ({ children, to, className, ...props }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`relative ${className}`}
    >
      <motion.div
        className="absolute -inset-1 bg-indigo-600 rounded-lg blur-md opacity-0 group-hover:opacity-75 dark:group-hover:opacity-50 transition-opacity duration-300"
        animate={{
          background: [
            'linear-gradient(45deg, #6366f1, #8b5cf6)',
            'linear-gradient(45deg, #8b5cf6, #ec4899)',
            'linear-gradient(45deg, #ec4899, #6366f1)',
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
        }}
      />
      <Link
        to={to}
        className="relative bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold px-8 py-4 rounded-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300 group"
        {...props}
      >
        {children}
      </Link>
    </motion.div>
  );
};

function Home() {
  const { user } = useAuth();
  const [stars, setStars] = useState([]);
  
  // Create floating stars for background
  useEffect(() => {
    const newStars = [];
    for (let i = 0; i < 30; i++) {
      newStars.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 5,
        duration: Math.random() * 4 + 2
      });
    }
    setStars(newStars);
  }, []);

  const features = [
    {
      icon: Search,
      title: "Smart Matching",
      description: "AI-powered matching connects students with companies based on skills, experience, and preferences.",
      color: "from-purple-500 to-indigo-600"
    },
    {
      icon: Users,
      title: "Student Profiles",
      description: "Showcase your skills with comprehensive profiles, CV uploads, and project portfolios.",
      color: "from-cyan-500 to-blue-600"
    },
    {
      icon: Building2,
      title: "Company Dashboard",
      description: "Powerful tools to search, filter, and manage internship candidates efficiently.",
      color: "from-emerald-500 to-teal-600"
    },
    {
      icon: CheckCircle,
      title: "Interview Management",
      description: "Integrated video interviews with scheduling and multi-round support.",
      color: "from-amber-500 to-orange-600"
    }
  ];

  const stats = [
    { number: "500+", label: "Students Registered", icon: UserPlus },
    { number: "100+", label: "Companies", icon: Building2 },
    { number: "250+", label: "Successful Matches", icon: CheckCircle },
    { number: "95%", label: "Satisfaction Rate", icon: BarChart2 }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Computer Science Student",
      text: "This platform helped me land my dream internship at Google! The matching system is incredibly accurate.",
      delay: 0.1
    },
    {
      name: "Michael Rodriguez",
      role: "HR Director, TechCorp",
      text: "We've hired 15 interns through this platform this year alone. The quality of candidates is outstanding.",
      delay: 0.3
    },
    {
      name: "Emily Chen",
      role: "Business Administration Student",
      text: "The interview scheduling feature saved me so much time. I had offers from 3 great companies!",
      delay: 0.5
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.15,
        ease: "easeInOut"
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.8, 
        ease: [0.25, 0.1, 0.25, 1],
        type: "spring",
        stiffness: 100
      } 
    }
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 1, 
        ease: "easeOut" 
      } 
    }
  };

  const rotate = {
    hidden: { rotate: -5, scale: 0.95, opacity: 0 },
    visible: { 
      rotate: 0, 
      scale: 1, 
      opacity: 1,
      transition: { 
        duration: 0.7, 
        ease: "backOut" 
      } 
    }
  };

  const AnimatedNumber = ({ value }) => {
    const [count, setCount] = useState(0);
    const [ref, isInView] = useViewportDetection({
      threshold: 0.1,
      triggerOnce: true
    });

    useEffect(() => {
      if (isInView) {
        const numValue = parseInt(value.replace('+', ''));
        
        const updateCount = () => {
          setCount(prev => {
            const next = prev + Math.ceil(numValue / 30);
            return next >= numValue ? numValue : next;
          });
        };
        
        const interval = setInterval(updateCount, 30);
        return () => clearInterval(interval);
      }
    }, [isInView, value]);

    return (
      <motion.span 
        ref={ref}
        className="text-3xl font-bold text-gray-900 dark:text-white"
      >
        {count}{value.includes('+') ? '+' : ''}
      </motion.span>
    );
  };

  if (user) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      >
        <BubblePop />

        <motion.div 
          className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center py-24"
          variants={item}
        >
          <motion.div 
            className="relative inline-block mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: 0.3,
              type: "spring", 
              stiffness: 200 
            }}
          >
            <div className="absolute -inset-4 bg-indigo-500/10 dark:bg-indigo-400/20 rounded-full blur-xl animate-pulse"></div>
            <h1 className="relative text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Welcome back, {user.name || 'User'}!
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-xl text-gray-700 dark:text-gray-300 mb-10 max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Ready to continue your internship journey? Let's get you connected.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
          >
            <GlowButton
              to={`/${user.userType}/dashboard`}
              className="inline-block"
            >
              <div className="flex items-center space-x-3">
                <span>Go to Dashboard</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.span>
              </div>
            </GlowButton>
          </motion.div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={container}
      className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 overflow-x-hidden"
    >
      <BubblePop />

      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {stars.map(star => (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-indigo-300 dark:bg-indigo-600"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
            }}
            animate={{
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              delay: star.delay,
            }}
          />
        ))}
        
        <motion.div 
          className="absolute top-1/4 left-10 w-80 h-80 bg-purple-300/10 dark:bg-purple-500/5 rounded-full blur-3xl"
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
          className="absolute bottom-1/3 right-10 w-96 h-96 bg-indigo-300/10 dark:bg-indigo-500/5 rounded-full blur-3xl"
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

      {/* Hero Section */}
      <section className="pt-28 pb-24 px-6 sm:px-10 lg:px-20 max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-16">
          <motion.div 
            className="text-center lg:text-left flex-1"
            variants={container}
          >
            <motion.div 
              variants={item}
              className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6"
            >
              <motion.span 
                className="text-sm font-semibold text-indigo-600 dark:text-indigo-300"
                animate={{ 
                  scale: [1, 1.05, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity 
                }}
              >
                Connecting Talent with Opportunity
              </motion.span>
            </motion.div>
            
            <motion.h1
              variants={item}
              className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-gray-100 mb-6"
            >
              Find Your Perfect{' '}
              <motion.span 
                className="relative inline-block text-indigo-600 dark:text-indigo-400"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  textShadow: [
                    "0 0 0 rgba(99, 102, 241, 0)",
                    "0 0 15px rgba(99, 102, 241, 0.5)",
                    "0 0 30px rgba(99, 102, 241, 0.3)",
                    "0 0 0 rgba(99, 102, 241, 0)"
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                style={{
                  background: 'linear-gradient(90deg, #7c3aed, #4f46e5, #7c3aed)',
                  backgroundSize: '200% 200%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Internship Match
              </motion.span>
            </motion.h1>
            
            <motion.p
              variants={item}
              className="text-xl text-gray-700 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 mb-12"
            >
              Connect talented students with forward-thinking companies. Our intelligent matching system ensures the perfect fit for both parties.
            </motion.p>
            
            <motion.div
              variants={item}
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-5"
            >
              <GlowButton
                to="/register"
                className=""
              >
                Get Started
              </GlowButton>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/login"
                  className="relative border-2 border-indigo-600 text-indigo-600 dark:text-white hover:bg-indigo-50 dark:hover:bg-indigo-900/30 font-semibold px-8 py-4 rounded-lg shadow-md transition-all duration-300"
                >
                  Sign In
                  <motion.span 
                    className="absolute inset-0 rounded-lg bg-indigo-600 opacity-0 hover:opacity-10 transition-opacity"
                    whileHover={{ 
                      opacity: 0.1,
                      transition: { duration: 0.3 }
                    }}
                  />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="flex-1 max-w-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: [0, -20, 0],
            }}
            transition={{ 
              duration: 0.8, 
              ease: "easeOut",
              y: {
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }
            }}
          >
            <div className="relative">
              <motion.div 
                className="absolute -inset-6 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl blur-xl opacity-20"
                animate={{
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div 
                className="absolute top-8 -right-8 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.img 
                src={InternshipImage}
                alt="Internship matching illustration"
                className="relative w-full h-auto rounded-2xl shadow-xl"
                animate={{
                  y: [0, -15, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <motion.section
        variants={container}
        className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 relative z-10"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              variants={item}
              className="relative p-5 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-md dark:shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700/50 group overflow-hidden"
              whileHover={{ 
                y: -8,
                boxShadow: "0 10px 25px rgba(99, 102, 241, 0.3)"
              }}
            >
              {/* Glow effect for light mode */}
              <motion.div 
                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                animate={{
                  background: [
                    'linear-gradient(45deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))',
                    'linear-gradient(45deg, rgba(139, 92, 246, 0.05), rgba(236, 72, 153, 0.05))',
                    'linear-gradient(45deg, rgba(236, 72, 153, 0.05), rgba(99, 102, 241, 0.05))',
                  ],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                }}
              />
              <motion.div 
                className="flex items-center justify-center w-14 h-14 mb-4 mx-auto bg-indigo-100 dark:bg-indigo-900/30 rounded-xl"
                whileHover={{ 
                  rotate: [0, 10, -10, 0],
                  transition: { duration: 0.8 }
                }}
              >
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                >
                  <Icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                </motion.div>
              </motion.div>
              <div className="h-10 mb-2 flex items-center justify-center">
                <AnimatedNumber value={stat.number} />
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-center mt-2 font-medium">{stat.label}</p>
              
              {/* Glow effect */}
              <motion.div 
                className="absolute inset-0 rounded-2xl bg-indigo-500 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
                animate={{
                  background: [
                    'linear-gradient(45deg, #6366f1, #8b5cf6)',
                    'linear-gradient(45deg, #8b5cf6, #ec4899)',
                    'linear-gradient(45deg, #ec4899, #6366f1)',
                  ],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                }}
              />
            </motion.div>
          );
        })}
      </motion.section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 mb-32 relative z-10">
        <motion.div className="text-center mb-16" variants={item}>
          <motion.h2 
            className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4"
            animate={{
              textShadow: ["0 0 0px rgba(99, 102, 241, 0)", "0 0 10px rgba(99, 102, 241, 0.3)", "0 0 0px rgba(99, 102, 241, 0)"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            Everything You Need for <span className="text-indigo-600">Successful Internships</span>
          </motion.h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Our comprehensive platform provides all the tools needed to connect students and companies
          </p>
        </motion.div>

        <motion.div
          variants={container}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {features.map(({ icon: Icon, title, description, color }, i) => (
            <motion.div
              key={i}
              variants={item}
              className={`bg-gradient-to-br ${color} p-0.5 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 group`}
              whileHover={{ 
                y: -10,
                scale: 1.03,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div 
                className="relative h-full bg-white dark:bg-gray-800 rounded-2xl p-6 flex flex-col overflow-hidden"
                animate={{ 
                  boxShadow: ["0 0 0 rgba(0,0,0,0)", "0 5px 15px rgba(99,102,241,0.2)", "0 0 0 rgba(0,0,0,0)"],
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.5
                }}
              >
                {/* Light mode glow effect */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/3 to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  animate={{
                    background: [
                      'linear-gradient(45deg, rgba(99, 102, 241, 0.03), rgba(139, 92, 246, 0.03))',
                      'linear-gradient(45deg, rgba(139, 92, 246, 0.03), rgba(236, 72, 153, 0.03))',
                      'linear-gradient(45deg, rgba(236, 72, 153, 0.03), rgba(99, 102, 241, 0.03))',
                    ],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                  }}
                />
                <div className="w-14 h-14 mb-6 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
                  <motion.div
                    animate={{ 
                      rotate: [0, 10, 0, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <Icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                  </motion.div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{title}</h3>
                <p className="text-gray-700 dark:text-gray-300 flex-grow">{description}</p>
                <motion.div 
                  className="mt-6 text-indigo-600 dark:text-indigo-400 flex items-center justify-end"
                  animate={{ 
                    x: [0, 5, 0],
                  }}
                  transition={{ 
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </motion.div>
              
              {/* Glow effect */}
              <motion.div 
                className="absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 group-hover:opacity-20 dark:group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
                animate={{
                  background: [
                    'linear-gradient(45deg, #6366f1, #8b5cf6)',
                    'linear-gradient(45deg, #8b5cf6, #ec4899)',
                    'linear-gradient(45deg, #ec4899, #6366f1)',
                  ],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 relative z-10">
          <motion.div className="text-center mb-20" variants={item}>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
              Success <span className="text-indigo-600">Stories</span>
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Hear from students and companies who found success with our platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                className="relative bg-white dark:bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700/50 group overflow-hidden"
                variants={item}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: testimonial.delay, duration: 0.7 }}
                whileHover={{ 
                  y: -10,
                  boxShadow: "0 15px 30px rgba(0,0,0,0.1)"
                }}
              >
                {/* Light mode glow effect */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/3 to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  animate={{
                    background: [
                      'linear-gradient(45deg, rgba(99, 102, 241, 0.03), rgba(139, 92, 246, 0.03))',
                      'linear-gradient(45deg, rgba(139, 92, 246, 0.03), rgba(236, 72, 153, 0.03))',
                      'linear-gradient(45deg, rgba(236, 72, 153, 0.03), rgba(99, 102, 241, 0.03))',
                    ],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                  }}
                />
                <div className="flex mb-4">
                  {[...Array(5)].map((_, starIndex) => (
                    <motion.div
                      key={starIndex}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 15, 0]
                      }}
                      transition={{ 
                        delay: starIndex * 0.1 + testimonial.delay,
                        duration: 0.5 
                      }}
                    >
                      <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                    </motion.div>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 italic mb-6">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                    <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">{testimonial.name}</h4>
                    <p className="text-indigo-600 dark:text-indigo-400 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                
                {/* Glow effect */}
                <motion.div 
                  className="absolute inset-0 rounded-2xl bg-indigo-500 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
                  animate={{
                    background: [
                      'linear-gradient(45deg, #6366f1, #8b5cf6)',
                      'linear-gradient(45deg, #8b5cf6, #ec4899)',
                      'linear-gradient(45deg, #ec4899, #6366f1)',
                    ],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 py-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white dark:from-gray-900 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-20 relative z-10">
          <motion.div className="text-center mb-20" variants={item}>
            <h2 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-4">
              How It <span className="text-indigo-600">Works</span>
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Simple steps to get started with your internship journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Students */}
            <motion.div variants={item} className="space-y-10">
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-4">
                <motion.div 
                  className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"
                  animate={{ 
                    rotate: [0, 10, 0, -10, 0],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </motion.div>
                For Students
              </h3>
              
              {[ 
                { 
                  title: "Create Your Profile", 
                  text: "Register and complete your profile with skills and preferences",
                  icon: UserPlus 
                },
                { 
                  title: "Upload Documents", 
                  text: "Add your CV and profile picture to showcase yourself",
                  icon: FileText 
                },
                { 
                  title: "Get Matched", 
                  text: "Receive interview invitations from interested companies",
                  icon: CheckCircle 
                }
              ].map(({title, text, icon: Icon}, i) => (
                <motion.div 
                  key={i}
                  variants={item}
                  className="relative flex items-start gap-5 p-5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700/50 group overflow-hidden"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 + 0.2 }}
                  whileHover={{ 
                    x: 10,
                    transition: { duration: 0.3 }
                  }}
                >
                  {/* Light mode glow effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/3 to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    animate={{
                      background: [
                        'linear-gradient(45deg, rgba(99, 102, 241, 0.03), rgba(139, 92, 246, 0.03))',
                        'linear-gradient(45deg, rgba(139, 92, 246, 0.03), rgba(236, 72, 153, 0.03))',
                        'linear-gradient(45deg, rgba(236, 72, 153, 0.03), rgba(99, 102, 241, 0.03))',
                      ],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                    }}
                  />
                  <motion.div 
                    className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg"
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  >
                    {i + 1}
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-xl">{title}</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{text}</p>
                  </div>
                  
                  {/* Glow effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-indigo-500 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
                    animate={{
                      background: [
                        'linear-gradient(45deg, #6366f1, #8b5cf6)',
                        'linear-gradient(45deg, #8b5cf6, #ec4899)',
                        'linear-gradient(45deg, #ec4899, #6366f1)',
                      ],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Companies */}
            <motion.div variants={item} className="space-y-10">
              <h3 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 flex items-center gap-4">
                <motion.div 
                  className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"
                  animate={{ 
                    rotate: [0, -10, 0, 10, 0],
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Building2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </motion.div>
                For Companies
              </h3>
              
              {[
                { 
                  title: "Register & Get Approved", 
                  text: "Submit your company details for admin verification",
                  icon: Briefcase 
                },
                { 
                  title: "Search Students", 
                  text: "Use filters to find candidates matching your requirements",
                  icon: Search 
                },
                { 
                  title: "Schedule Interviews", 
                  text: "Conduct multi-round interviews through our platform",
                  icon: Calendar 
                }
              ].map(({title, text, icon: Icon}, i) => (
                <motion.div 
                  key={i}
                  variants={item}
                  className="relative flex items-start gap-5 p-5 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 dark:border-gray-700/50 group overflow-hidden"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 + 0.2 }}
                  whileHover={{ 
                    x: -10,
                    transition: { duration: 0.3 }
                  }}
                >
                  {/* Light mode glow effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-500/3 to-purple-500/3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                    animate={{
                      background: [
                        'linear-gradient(45deg, rgba(99, 102, 241, 0.03), rgba(139, 92, 246, 0.03))',
                        'linear-gradient(45deg, rgba(139, 92, 246, 0.03), rgba(236, 72, 153, 0.03))',
                        'linear-gradient(45deg, rgba(236, 72, 153, 0.03), rgba(99, 102, 241, 0.03))',
                      ],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                    }}
                  />
                  <motion.div 
                    className="w-10 h-10 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-lg"
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.3
                    }}
                  >
                    {i + 1}
                  </motion.div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-xl">{title}</h4>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{text}</p>
                  </div>
                  
                  {/* Glow effect */}
                  <motion.div 
                    className="absolute inset-0 rounded-xl bg-indigo-500 opacity-0 group-hover:opacity-10 dark:group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"
                    animate={{
                      background: [
                        'linear-gradient(45deg, #6366f1, #8b5cf6)',
                        'linear-gradient(45deg, #8b5cf6, #ec4899)',
                        'linear-gradient(45deg, #ec4899, #6366f1)',
                      ],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <motion.section
        variants={item}
        className="py-20 px-6 sm:px-10 lg:px-20 text-center relative overflow-hidden"
      >
        <motion.div 
          className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 rounded-t-[3rem]"
          animate={{
            background: [
              'linear-gradient(45deg, #6366f1, #8b5cf6)',
              'linear-gradient(45deg, #8b5cf6, #6366f1)',
              'linear-gradient(45deg, #6366f1, #8b5cf6)',
            ],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
        />
        <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-white dark:from-gray-900 to-transparent"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <motion.h2 
            className="text-4xl font-extrabold text-white mb-5"
            animate={{
              scale: [1, 1.02, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            Ready to Start Your Journey?
          </motion.h2>
          
          <motion.p 
            className="text-lg text-indigo-100 max-w-3xl mx-auto mb-10"
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
          >
            Join thousands of students and companies who have found success through our platform.
          </motion.p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 max-w-xl mx-auto">
            <GlowButton
              to="/register"
              className=""
            >
              Register Now
            </GlowButton>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/login"
                className="relative border-2 border-white text-white font-bold px-10 py-4 rounded-lg hover:bg-white/10 transition-all duration-300"
              >
                Sign In
                <motion.span 
                  className="absolute inset-0 rounded-lg bg-white opacity-0 hover:opacity-10 transition-opacity"
                  whileHover={{ 
                    opacity: 0.1,
                    transition: { duration: 0.3 }
                  }}
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Enhanced light mode styles */}
      <style jsx global>{`
        /* Light mode specific enhancements */
        .light-mode-glow {
          position: relative;
          overflow: hidden;
        }
        
        .light-mode-glow::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(99, 102, 241, 0.05) 50%,
            transparent 100%
          );
          transform: rotate(45deg);
          animation: light-shine 3s infinite ease-in-out;
          pointer-events: none;
        }
        
        @keyframes light-shine {
          0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
          50% { transform: translateX(100%) translateY(100%) rotate(45deg); }
          100% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
        }
        
        /* Enhanced button hover effects for light mode */
        .light-mode-btn:hover {
          box-shadow: 0 0 20px rgba(99, 102, 241, 0.3);
          transform: translateY(-2px);
        }
        
        /* Card hover effects for light mode */
        .light-mode-card:hover {
          box-shadow: 0 10px 30px rgba(99, 102, 241, 0.15);
          transform: translateY(-5px);
        }
        
        /* Smooth transitions for all elements */
        * {
          transition: all 0.3s ease;
        }
        
        /* Reduced motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          .light-mode-glow::before,
          .light-mode-btn:hover,
          .light-mode-card:hover {
            animation: none;
            transform: none;
          }
        }
      `}</style>
    </motion.div>
  );
}

export default Home;