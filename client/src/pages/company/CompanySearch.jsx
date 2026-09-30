import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Search, 
  Filter, 
  User, 
  Mail, 
  Phone, 
  GraduationCap,
  Calendar,
  Clock,
  FileText,
  Camera,
  X,
  Star,
  Award,
  Code,
  Layers
} from 'lucide-react';

function CompanySearch() {
  const [filters, setFilters] = useState({
    experienceLevel: '',
    programmingLanguages: [],
    preferredDomains: []
  });
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  const [scheduleData, setScheduleData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    round: 1
  });

  const programmingLanguages = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 
    'Rust', 'Swift', 'Kotlin', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js'
  ];

  const domains = [
    'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 
    'AI', 'Cybersecurity', 'Cloud Computing', 'DevOps', 'UI/UX Design', 'Game Development'
  ];

  // Create floating particles animation
  const [particles, setParticles] = useState([]);
  
  // Add bubbles state
  const [bubbles, setBubbles] = useState([]);
  
  useEffect(() => {
    // Generate particles for background animation
    const newParticles = [];
    for (let i = 0; i < 60; i++) {
      newParticles.push({
        id: i,
        size: Math.random() * 4 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        delay: Math.random() * 10,
        duration: Math.random() * 15 + 10,
        opacity: Math.random() * 0.3 + 0.1,
        color: `rgba(${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 200) + 50}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.5 + 0.3})`,
        type: Math.random() > 0.7 ? 'circle' : 'line'
      });
    }
    setParticles(newParticles);

    // Generate bubbles that pop up
    const bubbleInterval = setInterval(() => {
      const newBubble = {
        id: Date.now() + Math.random(),
        size: Math.random() * 40 + 20,
        left: Math.random() * 100,
        top: Math.random() * 100,
        color: `rgba(${Math.floor(Math.random() * 100) + 100}, ${Math.floor(Math.random() * 200) + 100}, ${Math.floor(Math.random() * 255)}, ${Math.random() * 0.2 + 0.1})`,
        duration: Math.random() * 3 + 2
      };

      setBubbles(prev => [...prev, newBubble]);

      // Remove bubble after animation
      setTimeout(() => {
        setBubbles(prev => prev.filter(bubble => bubble.id !== newBubble.id));
      }, newBubble.duration * 1000);
    }, 800);

    return () => clearInterval(bubbleInterval);
  }, []);

  const handleLanguageToggle = (language) => {
    setFilters(prev => ({
      ...prev,
      programmingLanguages: prev.programmingLanguages.includes(language)
        ? prev.programmingLanguages.filter(l => l !== language)
        : [...prev.programmingLanguages, language]
    }));
  };

  const handleDomainToggle = (domain) => {
    setFilters(prev => ({
      ...prev,
      preferredDomains: prev.preferredDomains.includes(domain)
        ? prev.preferredDomains.filter(d => d !== domain)
        : [...prev.preferredDomains, domain]
    }));
  };

  const searchStudents = async () => {
    setLoading(true);
    
    try {
      const searchFilters = {
        ...filters,
        experienceLevel: filters.experienceLevel ? parseInt(filters.experienceLevel) : undefined
      };
      
      const response = await axios.post('/api/companies/search-students', searchFilters);
      setStudents(response.data.students);
      setSearched(true);
      
      toast.success(`Found ${response.data.count} students matching your criteria`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to search students');
    }
    
    setLoading(false);
  };

  const scheduleInterview = async () => {
    if (!scheduleData.scheduledDate || !scheduleData.scheduledTime) {
      toast.error('Please select date and time');
      return;
    }

    try {
      await axios.post('/api/companies/schedule-interview', {
        studentId: selectedStudent._id,
        ...scheduleData
      });
      
      toast.success('Interview scheduled successfully!');
      setShowScheduleModal(false);
      setSelectedStudent(null);
      setScheduleData({ scheduledDate: '', scheduledTime: '', round: 1 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to schedule interview');
    }
  };

  const clearFilters = () => {
    setFilters({
      experienceLevel: '',
      programmingLanguages: [],
      preferredDomains: []
    });
    setStudents([]);
    setSearched(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 py-8 px-4 sm:px-6 lg:px-8 pt-24 relative overflow-hidden">
      {/* Floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute animate-float ${particle.type === 'circle' ? 'rounded-full' : ''}`}
            style={{
              width: `${particle.type === 'line' ? particle.size * 10 : particle.size}px`,
              height: `${particle.type === 'line' ? 1 : particle.size}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `float ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
              opacity: particle.opacity,
              backgroundColor: particle.color,
              transform: particle.type === 'line' ? `rotate(${Math.random() * 360}deg)` : 'none'
            }}
          />
        ))}
      </div>

      {/* Animated bubbles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {bubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute rounded-full animate-bubble-pop"
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              left: `${bubble.left}%`,
              top: `${bubble.top}%`,
              backgroundColor: bubble.color,
              border: `2px solid ${bubble.color.replace('0.1', '0.3')}`,
              animation: `bubble-pop ${bubble.duration}s ease-out forwards`
            }}
          />
        ))}
      </div>

      {/* Shimmering grid overlay */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10" 
           style={{
             backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
             backgroundSize: '50px 50px'
           }}></div>

      {/* Radial gradient effects */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-gradient-to-br from-blue-900/20 to-transparent rounded-full filter blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>
      <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-gradient-to-tl from-purple-900/20 to-transparent rounded-full filter blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none z-0"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12 text-center relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full filter blur-3xl opacity-30"></div>
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4 relative">
            Discover Tech Talent
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg relative">
            Find exceptional students ready to innovate with your team
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <div className="px-3 py-1 bg-gradient-to-r from-blue-900/40 to-cyan-900/40 text-cyan-300 text-sm rounded-full flex items-center">
              <Award className="w-4 h-4 mr-1" />
              <span>Premium Talent</span>
            </div>
            <div className="px-3 py-1 bg-gradient-to-r from-purple-900/40 to-pink-900/40 text-pink-300 text-sm rounded-full flex items-center">
              <Code className="w-4 h-4 mr-1" />
              <span>Top Skills</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-2xl p-6 transition-all duration-300 hover:shadow-purple-500/10 border border-gray-700/50 relative overflow-hidden">
              {/* Sidebar decoration */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-600/10 to-blue-600/10 rounded-bl-full pointer-events-none"></div>
              
              <div className="flex items-center justify-between mb-6 relative z-10">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <Filter className="w-5 h-5 mr-2 text-cyan-400" />
                  Filters
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-colors flex items-center"
                >
                  <span>Clear All</span>
                </button>
              </div>

              <div className="space-y-6 relative z-10">
                {/* Experience Level */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Experience Level</label>
                  <div className="relative">
                    <select
                      value={filters.experienceLevel}
                      onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600/50 text-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all appearance-none backdrop-blur-sm"
                    >
                      <option value="">All Levels</option>
                      <option value="0">Beginner</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(year => (
                        <option key={year} value={year}>
                          {year === 10 ? '10+ years' : `${year} year${year > 1 ? 's' : ''}`}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Programming Languages */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-400">Programming Languages</label>
                    <span className="text-xs text-gray-500">{filters.programmingLanguages.length} selected</span>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto p-2 -m-2 custom-scrollbar">
                    {programmingLanguages.map((language) => (
                      <div 
                        key={language} 
                        onClick={() => handleLanguageToggle(language)}
                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                          filters.programmingLanguages.includes(language)
                            ? 'bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-700/50'
                            : 'bg-gray-700/50 hover:bg-gray-700/80'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center mr-3 transition-colors ${
                          filters.programmingLanguages.includes(language)
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500'
                            : 'bg-gray-600 border border-gray-500'
                        }`}>
                          {filters.programmingLanguages.includes(language) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm transition-colors ${
                          filters.programmingLanguages.includes(language)
                            ? 'text-cyan-300'
                            : 'text-gray-300 group-hover:text-white'
                        }`}>{language}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preferred Domains */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-400">Preferred Domains</label>
                    <span className="text-xs text-gray-500">{filters.preferredDomains.length} selected</span>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto p-2 -m-2 custom-scrollbar">
                    {domains.map((domain) => (
                      <div 
                        key={domain} 
                        onClick={() => handleDomainToggle(domain)}
                        className={`flex items-center p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                          filters.preferredDomains.includes(domain)
                            ? 'bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-700/50'
                            : 'bg-gray-700/50 hover:bg-gray-700/80'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center mr-3 transition-colors ${
                          filters.preferredDomains.includes(domain)
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                            : 'bg-gray-600 border border-gray-500'
                        }`}>
                          {filters.preferredDomains.includes(domain) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm transition-colors ${
                          filters.preferredDomains.includes(domain)
                            ? 'text-purple-300'
                            : 'text-gray-300 group-hover:text-white'
                        }`}>{domain}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={searchStudents}
                  disabled={loading}
                  className={`w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 group ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Search className="w-5 h-5 transition-transform group-hover:scale-110" />
                  <span>{loading ? 'Searching...' : 'Find Candidates'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {!searched ? (
              <div className="card text-center py-16 bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 transform transition-all duration-300 hover:scale-[1.01] relative">
                <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-full filter blur-xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full opacity-20 blur-md"></div>
                  <Search className="w-12 h-12 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-3 relative z-10">
                  Discover Top Talent
                </h3>
                <p className="text-gray-400 max-w-md mx-auto text-lg relative z-10">
                  Use filters to find exceptional students that match your requirements
                </p>
                <div className="mt-8 animate-bounce relative z-10">
                  <svg className="w-10 h-10 text-cyan-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
            ) : students.length === 0 ? (
              <div className="card text-center py-16 bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-700/50 transform transition-all duration-300 hover:scale-[1.01]">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <User className="w-12 h-12 text-purple-400" />
                </div>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
                  No Matches Found
                </h3>
                <p className="text-gray-400 max-w-md mx-auto text-lg">
                  Try adjusting your filters to find more candidates
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 py-2 px-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 text-purple-300 font-medium rounded-xl transition-all hover:bg-purple-900/60"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-gradient-to-r from-gray-800/70 to-gray-900/70 backdrop-blur-sm p-5 rounded-2xl shadow-lg border border-gray-700/50">
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      {students.length} Student{students.length !== 1 ? 's' : ''} Found
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Matching your search criteria</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm bg-gradient-to-r from-cyan-900/30 to-blue-900/30 px-3 py-1.5 rounded-full">
                    <Star className="w-4 h-4 text-cyan-400" fill="currentColor" />
                    <span className="text-cyan-300">Premium Talent</span>
                  </div>
                </div>

                <div className="grid gap-6">
                  {students.map((student, index) => (
                    <div 
                      key={student._id} 
                      className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-sm rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl overflow-hidden border border-gray-700/50 animate-fade-in relative group"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Card accent */}
                      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-600/10 to-blue-600/10 rounded-bl-full pointer-events-none"></div>
                      
                      <div className="p-6 relative z-10">
                        <div className="flex items-start space-x-5">
                          {/* Profile Picture */}
                          <div className="relative">
                            <div className="w-20 h-20 bg-gradient-to-br from-cyan-900/30 to-blue-900/30 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-600/50">
                              {student.profilePicturePath ? (
                                <img 
                                  src={`/uploads${student.profilePicturePath}`} 
                                  alt="Profile" 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : (
                                <div className="bg-gray-700 border-2 border-dashed border-gray-600 rounded-xl w-16 h-16 flex items-center justify-center">
                                  <Camera className="w-8 h-8 text-gray-500" />
                                </div>
                              )}
                              {/* Fallback div that shows when image fails to load */}
                              <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center rounded-xl text-white font-bold text-lg" style={{ display: 'none' }}>
                                {student.name?.charAt(0)?.toUpperCase() || 'S'}
                              </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center">
                              <Star className="w-3 h-3 mr-1" fill="white" />
                              <span>Lv. {student.experienceLevel}</span>
                            </div>
                          </div>

                          {/* Student Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-bold text-white flex items-center">
                                  {student.name}
                                  {student.experienceLevel > 7 && (
                                    <span className="ml-2 text-xs bg-gradient-to-r from-yellow-700/40 to-yellow-500/40 text-yellow-300 px-2 py-1 rounded-full flex items-center">
                                      <Award className="w-3 h-3 mr-1" />
                                      Expert
                                    </span>
                                  )}
                                </h3>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-400 mt-2">
                                  <span className="flex items-center bg-gray-700/60 px-3 py-1.5 rounded-full">
                                    <Mail className="w-4 h-4 mr-1.5 text-cyan-400" />
                                    {student.email}
                                  </span>
                                  <span className="flex items-center bg-gray-700/60 px-3 py-1.5 rounded-full">
                                    <GraduationCap className="w-4 h-4 mr-1.5 text-cyan-400" />
                                    {student.university}
                                  </span>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => {
                                  setSelectedStudent(student);
                                  setShowScheduleModal(true);
                                }}
                                className="flex items-center space-x-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2.5 rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl transform hover:-translate-y-0.5 group"
                              >
                                <Calendar className="w-4 h-4 transition-transform group-hover:scale-110" />
                                <span>Schedule</span>
                              </button>
                            </div>

                            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <h4 className="font-bold text-gray-300 mb-3 flex items-center">
                                  <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Experience
                                </h4>
                                <span className="px-3 py-1.5 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 text-cyan-300 text-sm font-medium rounded-full">
                                  {student.experienceLevel === 0 ? 'Beginner' : 
                                   student.experienceLevel === 10 ? '10+ years' :
                                   `${student.experienceLevel} year${student.experienceLevel > 1 ? 's' : ''}`}
                                </span>
                              </div>

                              <div>
                                <h4 className="font-bold text-gray-300 mb-3 flex items-center">
                                  <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                  </svg>
                                  Skills
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {student.programmingLanguages?.slice(0, 3).map((lang) => (
                                    <span key={lang} className="px-3 py-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs rounded-full flex items-center">
                                      <Code className="w-3 h-3 mr-1" />
                                      {lang}
                                    </span>
                                  ))}
                                  {student.programmingLanguages?.length > 3 && (
                                    <span className="px-3 py-1 bg-gray-700/60 text-gray-300 text-xs rounded-full">
                                      +{student.programmingLanguages.length - 3}
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-bold text-gray-300 mb-3 flex items-center">
                                  <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                  </svg>
                                  Interests
                                </h4>
                                <div className="flex flex-wrap gap-1.5">
                                  {student.preferredDomains?.slice(0, 2).map((domain) => (
                                    <span key={domain} className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs rounded-full flex items-center">
                                      <Layers className="w-3 h-3 mr-1" />
                                      {domain}
                                    </span>
                                  ))}
                                  {student.preferredDomains?.length > 2 && (
                                    <span className="px-3 py-1 bg-gray-700/60 text-gray-300 text-xs rounded-full">
                                      +{student.preferredDomains.length - 2}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {student.cvPath && (
                              <div className="mt-5">
                                <a 
                                  href={student.cvPath ? `/uploads${student.cvPath.startsWith('/') ? student.cvPath : `/${student.cvPath}`}` : '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center space-x-2 text-cyan-400 hover:text-cyan-300 font-medium transition-colors group"
                                  onClick={(e) => {
                                    if (!student.cvPath) {
                                      e.preventDefault();
                                      alert('No CV available for this student');
                                    } else {
                                      // Validate the CV path
                                      const cvUrl = `/uploads${student.cvPath.startsWith('/') ? student.cvPath : `/${student.cvPath}`}`;
                                      console.log('Opening CV:', cvUrl);
                                    }
                                  }}
                                >
                                  <FileText className="w-5 h-5 transition-transform group-hover:scale-110" />
                                  <span>View CV</span>
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Schedule Interview Modal */}
        {showScheduleModal && selectedStudent && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-lg flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-gradient-to-b from-gray-800 to-gray-900 border border-gray-700/50 rounded-2xl p-6 w-full max-w-md animate-scale-in shadow-2xl relative overflow-hidden">
              {/* Modal decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-full filter blur-xl -translate-y-1/2 translate-x-1/2"></div>
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <h3 className="text-xl font-bold text-white">
                  Schedule with {selectedStudent.name}
                </h3>
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setSelectedStudent(null);
                    setScheduleData({ scheduledDate: '', scheduledTime: '', round: 1 });
                  }}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-5 relative z-10">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Interview Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={scheduleData.scheduledDate}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600/50 text-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    <Calendar className="absolute right-3 top-3.5 w-5 h-5 text-gray-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Interview Time</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={scheduleData.scheduledTime}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600/50 text-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 backdrop-blur-sm"
                    />
                    <Clock className="absolute right-3 top-3.5 w-5 h-5 text-gray-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Interview Round</label>
                  <div className="relative">
                    <select
                      value={scheduleData.round}
                      onChange={(e) => setScheduleData(prev => ({ ...prev, round: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 bg-gray-700/70 border border-gray-600/50 text-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 appearance-none backdrop-blur-sm"
                    >
                      <option value={1}>Round 1: Technical Screening</option>
                      <option value={2}>Round 2: Technical Deep Dive</option>
                      <option value={3}>Round 3: Cultural Fit</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-8 relative z-10">
                <button
                  onClick={() => {
                    setShowScheduleModal(false);
                    setSelectedStudent(null);
                    setScheduleData({ scheduledDate: '', scheduledTime: '', round: 1 });
                  }}
                  className="flex-1 py-3 px-4 bg-gray-700/70 hover:bg-gray-700 text-gray-200 font-medium rounded-xl transition-colors backdrop-blur-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={scheduleInterview}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  Schedule Interview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-20px) translateX(10px) rotate(180deg);
            opacity: 0.3;
          }
          100% {
            transform: translateY(0) translateX(0) rotate(360deg);
            opacity: 0.1;
          }
        }
        
        @keyframes bubble-pop {
          0% {
            transform: scale(0) translateY(0);
            opacity: 0;
          }
          10% {
            transform: scale(0.8) translateY(-10px);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.2) translateY(-30px);
            opacity: 0.6;
          }
          100% {
            transform: scale(0.3) translateY(-100px);
            opacity: 0;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes scale-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
        
        .animate-bubble-pop {
          animation: bubble-pop 3s ease-out forwards;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(55, 65, 81, 0.3);
          border-radius: 4px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #3b82f6);
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
}

export default CompanySearch;