import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import FindEmail from './pages/FindEmail';
import ResetPassword from './pages/ResetPassword';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentOnboarding from './pages/student/StudentOnboarding';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanySearch from './pages/company/CompanySearch';
import CompanyInternships from './pages/company/CompanyInternships';
import CompanyAnalytics from './pages/company/CompanyAnalytics';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminStudents from './pages/admin/AdminStudents';
import Posts from './pages/Posts';
import AdminPosts from './pages/admin/AdminPosts';
import ZegoVideoRoomNew from './ZohoVideoRoomNew';
import ZegoVideoRoomCompany from './pages/company/ZohoVideoRoomCompany';

import { ThemeProvider } from './context/ThemeContext';
import About from './pages/About';

function AppNew() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
            <Navbar />
            <main className="pb-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/about" element={<About />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/find-email" element={<FindEmail />} />
                <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Student Routes */}
              <Route 
                path="/student/dashboard" 
                element={
                  <ProtectedRoute userType="student">
                    <StudentDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/profile" 
                element={
                  <ProtectedRoute userType="student">
                    <StudentProfile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/student/onboarding" 
                element={
                  <ProtectedRoute userType="student">
                    <StudentOnboarding />
                  </ProtectedRoute>
                } 
              />
              
              {/* Company Routes */}
              <Route 
                path="/company/dashboard" 
                element={
                  <ProtectedRoute userType="company">
                    <CompanyDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/company/internships" 
                element={
                  <ProtectedRoute userType="company">
                    <CompanyInternships />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/company/analytics" 
                element={
                  <ProtectedRoute userType="company">
                    <CompanyAnalytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/company/search" 
                element={
                  <ProtectedRoute userType="company">
                    <CompanySearch />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute userType="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/companies" 
                element={
                  <ProtectedRoute userType="admin">
                    <AdminCompanies />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/approvals" 
                element={
                  <ProtectedRoute userType="admin">
                    <AdminApprovals />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/students" 
                element={
                  <ProtectedRoute userType="admin">
                    <AdminStudents />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/posts" 
                element={
                  <ProtectedRoute userType="admin">
                    <AdminPosts />
                  </ProtectedRoute>
                } 
              />
                 <Route 
            path="/student/zehoNew/:interviewId" 
            element={
              <ProtectedRoute userType="student">
                <ZegoVideoRoomNew/>
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/company/zehoNew/:interviewId" 
            element={
              <ProtectedRoute userType="company">
                <ZegoVideoRoomCompany/>
              </ProtectedRoute>
            } 
          />
            </Routes>
          </main>
        </div>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default AppNew; 