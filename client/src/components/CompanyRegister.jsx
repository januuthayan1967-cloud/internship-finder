import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

function CompanyRegister() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    industry: '',
    website: '',
    description: '',
    location: '',
    size: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);

  const { register } = useAuth();
  const navigate = useNavigate();

  const companySizes = [
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '500+', label: '500+ employees' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.industry.trim()) newErrors.industry = 'Industry is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.size) newErrors.size = 'Company size is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    const { confirmPassword, ...registrationData } = formData;
    const formDataObj = new FormData();
    Object.entries(registrationData).forEach(([key, value]) => {
      formDataObj.append(key, value);
    });
    if (profilePicture) {
      formDataObj.append('profilePicture', profilePicture);
    }
    const result = await register(formDataObj, 'company');
    
    if (result.success) {
      navigate('/company/dashboard');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800/90 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/50 p-8 transition-colors duration-200">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Company Information</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Name */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Company Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={`input-field ${errors.name ? 'border-red-300 focus:ring-red-500' : ''}`}
            placeholder="Enter your company name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Company Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={`input-field ${errors.email ? 'border-red-300 focus:ring-red-500' : ''}`}
            placeholder="Enter company email address"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="form-error">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                className={`input-field pr-12 ${errors.password ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                className={`input-field pr-12 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500' : ''}`}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
          </div>
        </div>

        {/* Profile Picture */}
        <div className="form-group">
          <label htmlFor="profilePicture" className="form-label">Profile Picture (optional)</label>
          <input
            id="profilePicture"
            name="profilePicture"
            type="file"
            accept="image/*"
            className="input-field"
            onChange={handleFileChange}
          />
        </div>

        {/* Industry and Website */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="industry" className="form-label">
              Industry
            </label>
            <input
              id="industry"
              name="industry"
              type="text"
              required
              className={`input-field ${errors.industry ? 'border-red-300 focus:ring-red-500' : ''}`}
              placeholder="e.g., Technology, Healthcare"
              value={formData.industry}
              onChange={handleChange}
            />
            {errors.industry && <p className="form-error">{errors.industry}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="website" className="form-label">
              Website (Optional)
            </label>
            <input
              id="website"
              name="website"
              type="url"
              className="input-field"
              placeholder="https://www.company.com"
              value={formData.website}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Location and Size */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              required
              className={`input-field ${errors.location ? 'border-red-300 focus:ring-red-500' : ''}`}
              placeholder="City, Country"
              value={formData.location}
              onChange={handleChange}
            />
            {errors.location && <p className="form-error">{errors.location}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="size" className="form-label">
              Company Size
            </label>
            <select
              id="size"
              name="size"
              required
              className={`input-field ${errors.size ? 'border-red-300 focus:ring-red-500' : ''}`}
              value={formData.size}
              onChange={handleChange}
            >
              <option value="">Select company size</option>
              {companySizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
            {errors.size && <p className="form-error">{errors.size}</p>}
          </div>
        </div>

        {/* Description */}
        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Company Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="input-field"
            placeholder="Brief description of your company..."
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Creating Account...' : 'Create Company Account'}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Your company will need admin approval before you can start posting internships.
          </p>
        </div>
      </form>
    </div>
  );
}

export default CompanyRegister;