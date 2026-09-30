import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  User, 
  Code, 
  Target, 
  Upload, 
  CheckCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

function StudentOnboarding() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Step 1: Questions
  const [questions, setQuestions] = useState({
    experienceLevel: 0,
    programmingLanguages: [],
    preferredDomains: []
  });

  // Step 2: File uploads
  const [files, setFiles] = useState({
    cv: null,
    profilePicture: null
  });

  const programmingLanguages = [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 
    'Rust', 'Swift', 'Kotlin', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js'
  ];

  const domains = [
    'Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 
    'AI', 'Cybersecurity', 'Cloud Computing', 'DevOps', 'UI/UX Design', 'Game Development'
  ];

  const handleLanguageToggle = (language) => {
    setQuestions(prev => ({
      ...prev,
      programmingLanguages: prev.programmingLanguages.includes(language)
        ? prev.programmingLanguages.filter(l => l !== language)
        : [...prev.programmingLanguages, language]
    }));
  };

  const handleDomainToggle = (domain) => {
    setQuestions(prev => ({
      ...prev,
      preferredDomains: prev.preferredDomains.includes(domain)
        ? prev.preferredDomains.filter(d => d !== domain)
        : [...prev.preferredDomains, domain]
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles(prev => ({
      ...prev,
      [name]: selectedFiles[0]
    }));
  };

  const submitQuestions = async () => {
    if (questions.programmingLanguages.length === 0) {
      toast.error('Please select at least one programming language');
      return;
    }
    
    if (questions.preferredDomains.length === 0) {
      toast.error('Please select at least one preferred domain');
      return;
    }

    setLoading(true);
    
    try {
      await axios.post('/api/students/profile/questions', questions);
      toast.success('Profile questions updated!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update questions');
    }
    
    setLoading(false);
  };

  const submitFiles = async () => {
    if (!files.cv || !files.profilePicture) {
      toast.error('Please upload both CV and profile picture');
      return;
    }

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('cv', files.cv);
      formData.append('profilePicture', files.profilePicture);

      const response = await axios.post('/api/students/profile/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.profileCompleted) {
        updateUser({ profileCompleted: true });
        toast.success('Profile completed successfully!');
        navigate('/student/dashboard');
      } else {
        toast.success('Files uploaded successfully!');
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload files');
    }
    
    setLoading(false);
  };

  const renderStep1 = () => (
    <div className="space-y-8">
      {/* Experience Level */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          How many years of programming experience do you have?
        </h3>
        <div className="flex flex-wrap gap-3">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
            <button
              key={year}
              type="button"
              onClick={() => setQuestions(prev => ({ ...prev, experienceLevel: year }))}
              className={`px-4 py-2 rounded-xl border transition-all duration-200 text-sm font-medium ${
                questions.experienceLevel === year
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              {year === 0 ? 'Beginner' : year === 10 ? '10+' : `${year} year${year > 1 ? 's' : ''}`}
            </button>
          ))}
        </div>
      </div>

      {/* Programming Languages */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Code className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          Which programming languages do you know?
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {programmingLanguages.map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => handleLanguageToggle(language)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 ${
                questions.programmingLanguages.includes(language)
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              {language}
            </button>
          ))}
        </div>
      </div>

      {/* Preferred Domains */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <Target className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
          What domains interest you most?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {domains.map((domain) => (
            <button
              key={domain}
              type="button"
              onClick={() => handleDomainToggle(domain)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 text-left ${
                questions.preferredDomains.includes(domain)
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-indigo-300 dark:hover:border-indigo-600'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={submitQuestions}
          disabled={loading}
          className={`btn-primary flex items-center space-x-2 ${loading ? 'opacity-50' : ''}`}
        >
          <span>{loading ? 'Saving...' : 'Continue'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
        <Upload className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
        Upload your documents
      </h3>

      <div className="grid md:grid-cols-2 gap-8">
        {/* CV Upload */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">CV / Resume (PDF only)</h4>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl p-6 text-center transition-colors">
            <input
              type="file"
              name="cv"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="cv-upload"
            />
            <label htmlFor="cv-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {files.cv ? files.cv.name : 'Click to upload PDF'}
              </p>
            </label>
          </div>
        </div>

        {/* Profile Picture Upload */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">Profile Picture</h4>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl p-6 text-center transition-colors">
            <input
              type="file"
              name="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="picture-upload"
            />
            <label htmlFor="picture-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-indigo-500 dark:text-indigo-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {files.profilePicture ? files.profilePicture.name : 'Click to upload image'}
              </p>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => setStep(1)}
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={submitFiles}
          disabled={loading}
          className={`btn-primary flex items-center space-x-2 ${loading ? 'opacity-50' : ''}`}
        >
          <span>{loading ? 'Uploading...' : 'Complete Profile'}</span>
          <CheckCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-gray-50 to-purple-50/50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-12 pt-24 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Help us match you with the perfect internship opportunities
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                1
              </div>
              <span className="font-medium">Questions</span>
            </div>
            <div className={`w-16 h-1 rounded ${step >= 2 ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
            <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
              }`}>
                2
              </div>
              <span className="font-medium">Upload Files</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/50 p-8 transition-colors duration-200">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
        </div>
      </div>
    </div>
  );
}

export default StudentOnboarding;