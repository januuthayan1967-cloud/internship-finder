import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import Student from '../models/Student.js';
import Company from '../models/Company.js';
import Admin from '../models/Admin.js';
import { sendWelcomeEmail } from '../utils/email.js';
import { uploadSingle } from '../middleware/upload.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId, userType) => {
  return jwt.sign(
    { userId, userType },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

// Student Registration
router.post('/register/student', [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').matches(/^\d{10}$/).withMessage('Phone must be 10 digits'),
  body('university').trim().isLength({ min: 2 }).withMessage('University is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, phone, university } = req.body;

    // Check if student already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists with this email' });
    }

    // Create new student
    const student = new Student({
      name,
      email,
      password,
      phone,
      university
    });

    await student.save();

    // Generate token
    const token = generateToken(student._id, 'student');

    // Send welcome email
    await sendWelcomeEmail(email, name, 'student');

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        userType: 'student',
        profileCompleted: student.profileCompleted
      }
    });
  } catch (error) {
    console.error('Student registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Company Registration
router.post('/register/company', uploadSingle('profilePicture'), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Company name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('industry').trim().isLength({ min: 2 }).withMessage('Industry is required'),
  body('location').trim().isLength({ min: 2 }).withMessage('Location is required'),
  body('size').isIn(['1-10', '11-50', '51-200', '201-500', '500+']).withMessage('Valid company size required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, industry, website, description, location, size } = req.body;
    const profilePicture = req.file ? req.file.filename : undefined;

    // Check if company already exists
    const existingCompany = await Company.findOne({ email });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company already exists with this email' });
    }

    // Create new company
    const company = new Company({
      name,
      email,
      password,
      industry,
      website,
      description,
      location,
      size,
      profilePicture
    });

    await company.save();

    // Generate token
    const token = generateToken(company._id, 'company');

    // Send welcome email
    await sendWelcomeEmail(email, name, 'company');

    res.status(201).json({
      message: 'Company registered successfully. Awaiting admin approval.',
      token,
      user: {
        id: company._id,
        name: company.name,
        email: company.email,
        userType: 'company',
        isApproved: company.isApproved
      }
    });
  } catch (error) {
    console.error('Company registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Admin Registration
router.post('/register/admin', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists with this email' });
    }

    // Create new admin
    const admin = new Admin({
      name,
      email,
      password
    });

    await admin.save();

    // Generate token
    const token = generateToken(admin._id, 'admin');

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        userType: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
  body('userType').isIn(['student', 'company', 'admin']).withMessage('Valid user type required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, userType } = req.body;

    let user;
    let Model;

    switch (userType) {
      case 'student':
        Model = Student;
        break;
      case 'company':
        Model = Company;
        break;
      case 'admin':
        Model = Admin;
        break;
      default:
        return res.status(400).json({ message: 'Invalid user type' });
    }

    // Find user
    user = await Model.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id, userType);

    // Prepare user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType
    };

    // Add type-specific data
    if (userType === 'student') {
      userData.profileCompleted = user.profileCompleted;
    } else if (userType === 'company') {
      userData.isApproved = user.isApproved;
    }

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Forgot Password - Find User
router.post('/forgot-password/find-user', [
  body('recovery').notEmpty().withMessage('Phone number or email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { recovery } = req.body;
    let user = await Student.findOne({ $or: [{ email: recovery }, { phone: recovery }] });
    let userType = 'student';
    if (!user) {
      user = await Company.findOne({ $or: [{ email: recovery }, { phone: recovery }] });
      userType = 'company';
    }
    if (!user) {
      user = await Admin.findOne({ email: recovery });
      userType = 'admin';
    }
    if (!user) {
      return res.status(404).json({ message: 'No user found with that email or phone number' });
    }
    // For now, just return success and userType
    return res.json({ message: 'User found', userType });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error during forgot password' });
  }
});

// Reset Password - Legacy (keeping for backward compatibility)
router.post('/reset-password-legacy', async (req, res) => {
  try {
    const { recovery, password, userType } = req.body;
    if (!recovery || !password || !userType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    let user = null;
    let Model = null;
    if (userType === 'student') {
      Model = Student;
      user = await Model.findOne({ $or: [{ email: recovery }, { phone: recovery }] });
    } else if (userType === 'company') {
      Model = Company;
      user = await Model.findOne({ $or: [{ email: recovery }, { phone: recovery }] });
    } else if (userType === 'admin') {
      Model = Admin;
      user = await Model.findOne({ email: recovery });
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }
    user.password = password;
    await user.save(); // Mongoose pre-save hook will hash the password
    // Generate token
    const token = generateToken(user._id, userType);
    // Prepare user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType
    };
    if (userType === 'student') {
      userData.profileCompleted = user.profileCompleted;
    } else if (userType === 'company') {
      userData.isApproved = user.isApproved;
    }
    return res.json({ message: 'Password reset successful', token, user: userData });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
});

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Store OTPs in memory (in production, use Redis or database)
const otpStore = new Map();

// Send OTP
router.post('/send-otp', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    
    // Find user by email
    let user = await Student.findOne({ email });
    let userType = 'student';
    
    if (!user) {
      user = await Company.findOne({ email });
      userType = 'company';
    }
    
    if (!user) {
      user = await Admin.findOne({ email });
      userType = 'admin';
    }
    
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // In production, send OTP via email/SMS
    // For now, we'll just return it (for testing)
    console.log(`OTP for ${email}: ${otp}`);

    res.json({ 
      message: 'OTP sent successfully',
      userType 
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Server error while sending OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', [
  body('mail').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { mail, otp } = req.body;
    
    // Get stored OTP
    const storedData = otpStore.get(mail);
    
    if (!storedData) {
      return res.status(400).json({ message: 'No OTP found for this email' });
    }
    
    // Check if OTP is expired
    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(mail);
      return res.status(400).json({ message: 'OTP has expired' });
    }
    
    // Verify OTP
    if (storedData.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    
    // Find user
    let user = await Student.findOne({ email: mail });
    let userType = 'student';
    
    if (!user) {
      user = await Company.findOne({ email: mail });
      userType = 'company';
    }
    
    if (!user) {
      user = await Admin.findOne({ email: mail });
      userType = 'admin';
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Clear OTP after successful verification
    otpStore.delete(mail);
    
    // Generate token
    const token = generateToken(user._id, userType);
    
    // Prepare user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType
    };
    
    if (userType === 'student') {
      userData.profileCompleted = user.profileCompleted;
    } else if (userType === 'company') {
      userData.isApproved = user.isApproved;
    }
    
    res.json({
      message: 'OTP verified successfully',
      token,
      user: userData,
      userId: user._id
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
});

// Resend OTP
router.post('/resend-otp', [
  body('mail').isEmail().normalizeEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { mail } = req.body;
    
    // Find user by email
    let user = await Student.findOne({ email: mail });
    let userType = 'student';
    
    if (!user) {
      user = await Company.findOne({ email: mail });
      userType = 'company';
    }
    
    if (!user) {
      user = await Admin.findOne({ email: mail });
      userType = 'admin';
    }
    
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    // Generate new OTP
    const otp = generateOTP();
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(mail, {
      otp,
      expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
    });

    // In production, send OTP via email/SMS
    // For now, we'll just return it (for testing)
    console.log(`New OTP for ${mail}: ${otp}`);

    res.json({ 
      message: 'OTP resent successfully',
      userType 
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Server error while resending OTP' });
  }
});

// Update Password (for OTP verified users)
router.post('/update-password', authenticate, async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Update password based on user type
    let user;
    switch (req.userType) {
      case 'student':
        user = await Student.findById(req.user._id);
        break;
      case 'company':
        user = await Company.findById(req.user._id);
        break;
      case 'admin':
        user = await Admin.findById(req.user._id);
        break;
      default:
        return res.status(400).json({ message: 'Invalid user type' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (Mongoose pre-save hook will hash it)
    user.password = password;
    await user.save();

    res.json({ 
      message: 'Password updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType: req.userType
      }
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Server error during password update' });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Find user by email
    let user = await Student.findOne({ email: email.trim() });
    let userType = 'student';
    
    if (!user) {
      user = await Company.findOne({ email: email.trim() });
      userType = 'company';
    }
    
    if (!user) {
      user = await Admin.findOne({ email: email.trim() });
      userType = 'admin';
    }
    
    if (!user) {
      return res.status(404).json({ message: 'No account found with this email address' });
    }

    // Generate reset token (in production, this would be sent via email)
    const resetToken = jwt.sign(
      { userId: user._id, userType, email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Store reset token with expiration
    otpStore.set(email, {
      resetToken,
      expiresAt: Date.now() + 60 * 60 * 1000 // 1 hour
    });

    // In production, send reset link via email
    // For now, we'll just return the token (for testing)
    console.log(`Reset token for ${email}: ${resetToken}`);

    res.json({ 
      message: 'Password reset link sent successfully',
      resetToken, // Remove this in production
      userType 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error while processing request' });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, password, token } = req.body;
    
    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!token) {
      return res.status(400).json({ message: 'Reset token is required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.email !== email) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Check if token exists and is not expired
    const storedData = otpStore.get(email);
    if (!storedData || storedData.resetToken !== token || Date.now() > storedData.expiresAt) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Find and update user
    let user = await Student.findOne({ email });
    let userType = 'student';
    
    if (!user) {
      user = await Company.findOne({ email });
      userType = 'company';
    }
    
    if (!user) {
      user = await Admin.findOne({ email });
      userType = 'admin';
    }
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password (Mongoose pre-save hook will hash it)
    user.password = password;
    await user.save();

    // Remove the reset token
    otpStore.delete(email);

    res.json({ 
      message: 'Password reset successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userType
      }
    });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }
    res.status(500).json({ message: 'Server error while resetting password' });
  }
});

// Find Email by Phone Number or Recovery Email
router.post('/find-email', [
  body('identifier').trim().notEmpty().withMessage('Phone number or recovery email is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { identifier } = req.body;

    // Check if identifier is an email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
    
    let user = null;
    let userType = '';

    if (isEmail) {
      // Search by email across all user types
      user = await Student.findOne({ email: identifier.toLowerCase() });
      if (user) userType = 'student';
      
      if (!user) {
        user = await Company.findOne({ email: identifier.toLowerCase() });
        if (user) userType = 'company';
      }
      
      if (!user) {
        user = await Admin.findOne({ email: identifier.toLowerCase() });
        if (user) userType = 'admin';
      }
    } else {
      // Search by phone number across all user types
      user = await Student.findOne({ phone: identifier });
      if (user) userType = 'student';
      
      if (!user) {
        user = await Company.findOne({ phone: identifier });
        if (user) userType = 'company';
      }
      
      if (!user) {
        user = await Admin.findOne({ phone: identifier });
        if (user) userType = 'admin';
      }
    }

    if (!user) {
      return res.status(404).json({ 
        message: 'No account found with this phone number or recovery email' 
      });
    }

    // Return the email (masked for security)
    const email = user.email;
    const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');

    res.json({
      success: true,
      message: 'Email found successfully',
      email: user.email, // Return full email for password reset flow
      maskedEmail, // Return masked email for display
      userType
    });

  } catch (error) {
    console.error('Find email error:', error);
    res.status(500).json({ message: 'Server error while finding email' });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Auth service is running',
    timestamp: new Date().toISOString()
  });
});

export default router;