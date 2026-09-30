import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Search,
  Building2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

function AdminApprovals() {
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [expandedCompany, setExpandedCompany] = useState(null);

  useEffect(() => {
    fetchPendingCompanies();
  }, []);

  const fetchPendingCompanies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/companies/pending');
      setPendingCompanies(response.data);
    } catch (error) {
      toast.error('Failed to fetch pending companies');
    } finally {
      setLoading(false);
    }
  };

  const approveCompany = async (companyId) => {
    try {
      await axios.put(`/api/admin/companies/${companyId}/approve`);
      toast.success('Company approved successfully!');
      setPendingCompanies(prev => prev.filter(c => c._id !== companyId));
      setSelectedCompanies(prev => prev.filter(id => id !== companyId));
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
      setSelectedCompanies(prev => prev.filter(id => id !== companyId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject company');
    }
  };

  const bulkApprove = async () => {
    if (!window.confirm(`Are you sure you want to approve ${selectedCompanies.length} companies?`)) {
      return;
    }

    try {
      const promises = selectedCompanies.map(id => approveCompany(id));
      await Promise.all(promises);
      toast.success(`${selectedCompanies.length} companies approved successfully!`);
      setSelectedCompanies([]);
    } catch (error) {
      toast.error('Failed to approve some companies');
    }
  };

  const bulkReject = async () => {
    if (!window.confirm(`Are you sure you want to reject ${selectedCompanies.length} companies? This action cannot be undone.`)) {
      return;
    }

    try {
      const promises = selectedCompanies.map(id => rejectCompany(id));
      await Promise.all(promises);
      toast.success(`${selectedCompanies.length} companies rejected successfully!`);
      setSelectedCompanies([]);
    } catch (error) {
      toast.error('Failed to reject some companies');
    }
  };

  const toggleCompanySelection = (companyId) => {
    setSelectedCompanies(prev => 
      prev.includes(companyId) 
        ? prev.filter(id => id !== companyId)
        : [...prev, companyId]
    );
  };

  const toggleSelectAll = () => {
    const filteredCompanies = getFilteredCompanies();
    if (selectedCompanies.length === filteredCompanies.length) {
      setSelectedCompanies([]);
    } else {
      setSelectedCompanies(filteredCompanies.map(c => c._id));
    }
  };

  const getFilteredCompanies = () => {
    if (!searchTerm) return pendingCompanies;
    
    return pendingCompanies.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const toggleCompanyExpand = (companyId) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
  };

  const getDaysSinceRegistration = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const filteredCompanies = getFilteredCompanies();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8 pt-24 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pending Approvals</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Review and approve companies waiting for platform access
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50 transition-colors">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-yellow-500 bg-opacity-20">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{pendingCompanies.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50 transition-colors">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-blue-500 bg-opacity-20">
                <Calendar className="w-6 h-6 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">New Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingCompanies.filter(c => {
                    const today = new Date();
                    const created = new Date(c.createdAt);
                    return today.toDateString() === created.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50 transition-colors">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-red-500 bg-opacity-20">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">Over 7 Days</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pendingCompanies.filter(c => getDaysSinceRegistration(c.createdAt) > 7).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg border border-gray-100 dark:border-gray-700/50 transition-colors">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCompanies.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="font-medium text-blue-700 dark:text-blue-300">
                {selectedCompanies.length} company{selectedCompanies.length !== 1 ? 'ies' : 'y'} selected
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={bulkApprove}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Approve All</span>
                </button>
                <button
                  onClick={bulkReject}
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject All</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Companies List */}
        <div className="space-y-4">
          {filteredCompanies.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg border border-gray-100 dark:border-gray-700/50 transition-colors">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No pending approvals</h3>
              <p className="text-gray-600 dark:text-gray-400">All companies have been reviewed and processed.</p>
            </div>
          ) : (
            filteredCompanies.map((company) => {
              const daysSinceRegistration = getDaysSinceRegistration(company.createdAt);
              const isUrgent = daysSinceRegistration > 7;
              
              return (
                <div
                  key={company._id}
                  className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700/50 transition-colors ${
                    isUrgent ? 'border-l-4 border-l-red-500' : ''
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(company._id)}
                          onChange={() => toggleCompanySelection(company._id)}
                          className="mt-1 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{company.name}</h3>
                            {isUrgent && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Urgent
                              </span>
                            )}
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300">
                              Pending
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{company.email}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">{company.industry}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{company.location}</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">{company.size} employees</span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {daysSinceRegistration} day{daysSinceRegistration !== 1 ? 's' : ''} ago
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleCompanyExpand(company._id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => approveCompany(company._id)}
                          className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => rejectCompany(company._id)}
                          className="flex items-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedCompany === company._id && (
                      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Company Information</h4>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <strong className="text-gray-800 dark:text-gray-200">Name:</strong> {company.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <strong className="text-gray-800 dark:text-gray-200">Email:</strong> {company.email}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <strong className="text-gray-800 dark:text-gray-200">Industry:</strong> {company.industry}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <strong className="text-gray-800 dark:text-gray-200">Location:</strong> {company.location}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <strong className="text-gray-800 dark:text-gray-200">Size:</strong> {company.size} employees
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Registration Details</h4>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <strong className="text-gray-800 dark:text-gray-200">Registered:</strong> {new Date(company.createdAt).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                <strong className="text-gray-800 dark:text-gray-200">Time since registration:</strong> {daysSinceRegistration} day{daysSinceRegistration !== 1 ? 's' : ''}
                              </p>
                              {isUrgent && (
                                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg">
                                  <p className="text-sm text-red-700 dark:text-red-300">
                                    <strong>Note:</strong> This company has been waiting for approval for over a week.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {company.description && (
                          <div className="mt-6">
                            <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Company Description</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{company.description}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminApprovals;
