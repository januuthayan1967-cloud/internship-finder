import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentOnboarding from './pages/student/StudentOnboarding';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanySearch from './pages/company/CompanySearch';
import AdminDashboard from './pages/admin/AdminDashboard';
import ZegoVideoRoom from './ZohoVideoRoom';
import ScheduleMeeting from './Test.jsx';
import JoinMeeting from './Test2.jsx';
import ZegoVideoRoomNew from './ZohoVideoRoomNew';
import ZegoVideoRoomCompany from './pages/company/ZohoVideoRoomCompany';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyOtp from './pages/VerifyOtp';
import TestOtpFlow from './pages/TestOtpFlow';
import FileUploadDemo from './pages/FileUploadDemo';
import OTPDemo from './pages/OTPDemo';
import Posts from './pages/Posts';
import AdminPosts from './pages/admin/AdminPosts';

import About from './pages/About';

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Navbar />
      <main className="pb-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts" element={<Posts />} />
          <Route 
            path="/login" 
            element={user ? <Navigate to={`/${user.userType}/dashboard`} /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to={`/${user.userType}/dashboard`} /> : <Register />} 
          />
          <Route 
            path="/forgot-password" 
            element={<ForgotPassword />} 
          />
          <Route 
            path="/reset-password" 
            element={<ResetPassword />} 
          />
          <Route 
            path="/verify-otp" 
            element={<VerifyOtp />} 
          />
          <Route 
            path="/test-otp" 
            element={<TestOtpFlow />} 
          />
          <Route 
            path="/file-upload-demo" 
            element={<FileUploadDemo />} 
          />
          <Route 
            path="/otp-demo" 
            element={<OTPDemo />} 
          />
          <Route 
            path="/about" 
            element={<About />} 
          />
          
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


            <Route 
            path="/student/videoCall" 
            element={
              <ProtectedRoute userType="student">
                <ZegoVideoRoom/>
              </ProtectedRoute>
            } 
          />
            <Route 
            path="/scheduleMeeting" 
            element={
              <ProtectedRoute userType="student">
                <ScheduleMeeting/>
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

           <Route 
            path="/test2" 
            element={
              <ProtectedRoute userType="student">
                <JoinMeeting/>
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
            path="/admin/posts" 
            element={
              <ProtectedRoute userType="admin">
                <AdminPosts />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;