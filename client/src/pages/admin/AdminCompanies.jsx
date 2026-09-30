import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Search, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Trash2,
  Clock,
  CheckSquare,
  Square
} from 'lucide-react';

function AdminCompanies() {
  const [companies, setCompanies] = useState([]);
  const [pendingCompanies, setPendingCompanies] = useState([]);
  const [approvedCompanies, setApprovedCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [expandedCompany, setExpandedCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const [pendingRes, approvedRes] = await Promise.all([
        axios.get('/api/admin/companies/pending'),
        axios.get('/api/admin/companies/approved')
      ]);

      setPendingCompanies(pendingRes.data);
      setApprovedCompanies(approvedRes.data);
      setCompanies([...pendingRes.data, ...approvedRes.data]);
    } catch (error) {
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  const approveCompany = async (companyId) => {
    try {
      await axios.put(`/api/admin/companies/${companyId}/approve`);
      toast.success('Company approved successfully!');
      
      const company = pendingCompanies.find(c => c._id === companyId);
      setPendingCompanies(prev => prev.filter(c => c._id !== companyId));
      setApprovedCompanies(prev => [...prev, { ...company, isApproved: true }]);
      setCompanies(prev => prev.map(c => c._id === companyId ? { ...c, isApproved: true } : c));
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
      setCompanies(prev => prev.filter(c => c._id !== companyId));
      setSelectedCompanies(prev => prev.filter(id => id !== companyId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject company');
    }
  };

  const deleteCompany = async (companyId) => {
    if (!window.confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/api/admin/companies/${companyId}/delete`);
      toast.success('Company deleted successfully');
      
      setApprovedCompanies(prev => prev.filter(c => c._id !== companyId));
      setCompanies(prev => prev.filter(c => c._id !== companyId));
      setSelectedCompanies(prev => prev.filter(id => id !== companyId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete company');
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
    let filtered = companies;

    if (filterStatus === 'pending') {
      filtered = filtered.filter(c => !c.isApproved);
    } else if (filterStatus === 'approved') {
      filtered = filtered.filter(c => c.isApproved);
    }

    if (searchTerm) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const toggleCompanyExpand = (companyId) => {
    setExpandedCompany(expandedCompany === companyId ? null : companyId);
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Company Management</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Manage all registered companies and their approval status
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: 'Total Companies',
              value: companies.length,
              icon: Building2,
              color: 'bg-blue-500'
            },
            {
              title: 'Pending Approval',
              value: pendingCompanies.length,
              icon: Clock,
              color: 'bg-yellow-500'
            },
            {
              title: 'Approved',
              value: approvedCompanies.length,
              icon: CheckCircle,
              color: 'bg-green-500'
            },
            {
              title: 'Selected',
              value: selectedCompanies.length,
              icon: CheckSquare,
              color: 'bg-purple-500'
            }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700/50 transition-colors">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color} bg-opacity-20`}>
                    <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 shadow-lg border border-gray-100 dark:border-gray-700/50 transition-colors">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies by name, email, industry, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedCompanies.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-blue-700">
                  {selectedCompanies.length} company{selectedCompanies.length !== 1 ? 'ies' : 'y'} selected
                </span>
                <button
                  onClick={() => setSelectedCompanies([])}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Clear selection
                </button>
              </div>
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

        {/* Companies Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700/50 transition-colors">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.length === filteredCompanies.length && filteredCompanies.length > 0}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Industry
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Registered
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredCompanies.map((company) => (
                  <tr key={company._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedCompanies.includes(company._id)}
                        onChange={() => toggleCompanySelection(company._id)}
                        className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {company.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {company.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-200">{company.industry}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{company.size} employees</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-gray-200">{company.location}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        company.isApproved
                          ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {company.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(company.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => toggleCompanyExpand(company._id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {!company.isApproved ? (
                          <>
                            <button
                              onClick={() => approveCompany(company._id)}
                              className="p-1.5 rounded-lg text-green-600 hover:text-green-700 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => rejectCompany(company._id)}
                              className="p-1.5 rounded-lg text-red-600 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => deleteCompany(company._id)}
                            className="p-1.5 rounded-lg text-red-600 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded Company Details */}
          {expandedCompany && (
            <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 p-6 transition-colors">
              {(() => {
                const company = companies.find(c => c._id === expandedCompany);
                if (!company) return null;
                
                return (
                  <div>
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
                          {company.isApproved && company.approvedAt && (
                            <p className="text-sm text-gray-600 dark:text-gray-300">
                              <strong className="text-gray-800 dark:text-gray-200">Approved:</strong> {new Date(company.approvedAt).toLocaleDateString()}
                            </p>
                          )}
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            company.isApproved
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
                              : 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300'
                          }`}>
                            {company.isApproved ? 'Approved' : 'Pending Approval'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {company.description && (
                      <div className="mt-6">
                        <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Description</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{company.description}</p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminCompanies;
