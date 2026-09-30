import express from 'express';
import { body, validationResult } from 'express-validator';
import Company from '../models/Company.js';
import Student from '../models/Student.js';
import { authenticate, authorizeCompany, authorizeApprovedCompany } from '../middleware/auth.js';
import Report from '../models/Report.js';
import { sendInterviewEmail } from '../utils/email.js';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

// Get company profile
router.get('/profile', authenticate, authorizeCompany, async (req, res) => {
  try {
    const company = await Company.findById(req.user._id).select('-password');
    res.json(company);
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update company profile
router.put('/profile', [
  authenticate,
  authorizeCompany,
  body('name').optional().isLength({ min: 1, max: 100 }).withMessage('Company name must be between 1 and 100 characters'),
  body('industry').optional().isLength({ min: 1 }).withMessage('Industry is required'),
  body('website').optional().isURL().withMessage('Please enter a valid website URL'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('location').optional().isLength({ min: 1 }).withMessage('Location is required'),
  body('size').optional().isIn(['1-10', '11-50', '51-200', '201-500', '500+']).withMessage('Invalid company size')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, industry, website, description, location, size } = req.body;
    
    const company = await Company.findById(req.user._id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Update fields
    if (name) company.name = name;
    if (industry) company.industry = industry;
    if (website !== undefined) company.website = website;
    if (description !== undefined) company.description = description;
    if (location) company.location = location;
    if (size) company.size = size;

    await company.save();
    
    res.json({ 
      message: 'Company profile updated successfully',
      company: {
        _id: company._id,
        name: company.name,
        email: company.email,
        industry: company.industry,
        website: company.website,
        profilePicture: company.profilePicture,
        description: company.description,
        location: company.location,
        size: company.size,
        isApproved: company.isApproved
      }
    });
  } catch (error) {
    console.error('Update company profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update company profile picture
router.put('/profile-picture', [
  authenticate,
  authorizeCompany,
  body('profilePicture').isLength({ min: 1 }).withMessage('Profile picture URL is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { profilePicture } = req.body;
    
    const company = await Company.findById(req.user._id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.profilePicture = profilePicture;
    await company.save();
    
    res.json({ 
      message: 'Profile picture updated successfully',
      profilePicture: company.profilePicture
    });
  } catch (error) {
    console.error('Update profile picture error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete company profile (soft delete - mark as inactive)
router.delete('/profile', authenticate, authorizeCompany, async (req, res) => {
  try {
    const company = await Company.findById(req.user._id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Soft delete - mark as inactive instead of actually deleting
    company.isActive = false;
    company.deletedAt = new Date();
    await company.save();
    
    res.json({ message: 'Company profile deactivated successfully' });
  } catch (error) {
    console.error('Delete company profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search students based on filters
router.post('/search-students', [
  authenticate,
  authorizeApprovedCompany,
  body('experienceLevel').optional().isInt({ min: 0, max: 10 }),
  body('programmingLanguages').optional().isArray(),
  body('preferredDomains').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { experienceLevel, programmingLanguages, preferredDomains } = req.body;
    
    // Build query
    let query = { profileCompleted: true };
    
    if (experienceLevel !== undefined) {
      query.experienceLevel = { $gte: experienceLevel };
    }
    
    if (programmingLanguages && programmingLanguages.length > 0) {
      query.programmingLanguages = { $in: programmingLanguages };
    }
    
    if (preferredDomains && preferredDomains.length > 0) {
      query.preferredDomains = { $in: preferredDomains };
    }

    const students = await Student.find(query)
      .select('-password -notifications')
      .limit(50);

    res.json({
      students,
      count: students.length,
      filters: { experienceLevel, programmingLanguages, preferredDomains }
    });
  } catch (error) {
    console.error('Search students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Schedule interview
router.post('/schedule-interview', [
  authenticate,
  authorizeApprovedCompany,
  body('studentId').isMongoId().withMessage('Valid student ID required'),
  body('scheduledDate').isISO8601().withMessage('Valid date required'),
  body('scheduledTime').isLength({ min: 1 }).withMessage('Time is required'),
  body('round').optional().isInt({ min: 1, max: 3 }).withMessage('Round must be 1-3')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { studentId, scheduledDate, scheduledTime, round = 1 } = req.body;

    // Normalize and validate time (HH:mm)
    const timeMatch = String(scheduledTime).match(/^([01]?\d|2[0-3]):([0-5]\d)$/);
    if (!timeMatch) {
      return res.status(400).json({ message: 'Invalid time format. Use HH:mm (24h).' });
    }

    // Build a Date object that combines date + time for validation purposes
    const startAt = new Date(scheduledDate);
    if (Number.isNaN(startAt.getTime())) {
      return res.status(400).json({ message: 'Invalid date.' });
    }
    const [hh, mm] = scheduledTime.split(':').map(n => parseInt(n, 10));
    startAt.setHours(hh, mm, 0, 0);
    if (startAt.getTime() < Date.now()) {
      return res.status(400).json({ message: 'Interview date/time must be in the future.' });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.profileCompleted) {
      return res.status(400).json({ message: 'Student profile is not completed' });
    }

    // Generate room ID
    const roomId = `interview_${req.user._id}_${studentId}_${Date.now()}`;

    // Add interview to company
    const company = await Company.findById(req.user._id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    company.interviews.push({
      studentId,
      scheduledDate: startAt, // store as Date
      scheduledTime,
      round,
      roomId,
      status: 'scheduled'
    });
    await company.save();

    // Add interview to student
    student.interviews.push({
      companyId: req.user._id,
      companyName: company.name,
      scheduledDate: startAt,
      scheduledTime,
      round,
      roomId,
      status: 'scheduled'
    });

    // Add notification to student
    student.notifications.push({
      message: `Interview scheduled with ${company.name} on ${new Date(scheduledDate).toLocaleDateString()} at ${scheduledTime}`,
      type: 'interview'
    });

    await student.save();

    // Send email notification
    try {
      await sendInterviewEmail(
        student.email,
        student.name,
        company.name,
        startAt,
        scheduledTime,
        roomId
      );
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue with the response even if email fails
    }

    res.json({
      message: 'Interview scheduled successfully',
      interview: {
        studentId,
        studentName: student.name,
        scheduledDate: startAt,
        scheduledTime,
        round,
        roomId,
        status: 'scheduled'
      }
    });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get company interviews
router.get('/interviews', authenticate, authorizeApprovedCompany, async (req, res) => {
  try {
    const company = await Company.findById(req.user._id)
      .select('interviews')
      .populate('interviews.studentId', 'name email phone university');
    
    res.json(company.interviews.sort((a, b) => b.createdAt - a.createdAt));
  } catch (error) {
    console.error('Get company interviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update interview status
router.put('/interviews/:interviewId', [
  authenticate,
  authorizeApprovedCompany,
  body('status').isIn(['scheduled', 'completed', 'cancelled']).withMessage('Valid status required'),
  body('feedback').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, feedback } = req.body;
    
    const company = await Company.findById(req.user._id);
    const interview = company.interviews.id(req.params.interviewId);
    
    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    interview.status = status;
    if (feedback) interview.feedback = feedback;
    
    await company.save();

    // Update student's interview status
    const student = await Student.findById(interview.studentId);
    const studentInterview = student.interviews.find(i => 
      i.companyId.toString() === req.user._id.toString() && 
      i.roomId === interview.roomId
    );
    
    if (studentInterview) {
      studentInterview.status = status;
      await student.save();
    }

    res.json({
      message: 'Interview updated successfully',
      interview
    });
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

////////////////////////////////////////////////////////////////////////

// Create a new internship post
router.post('/internships', authenticate, authorizeApprovedCompany, async (req, res) => {
  try {
    const company = await Company.findById(req.user._id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const post = {
      title: req.body.title,
      description: req.body.description,
      image: req.body.image, // Add image field
      requirements: req.body.requirements,
      duration: req.body.duration,
      stipend: req.body.stipend,
      location: req.body.location,
      isActive: true,
      createdAt: new Date()
    };
    company.internshipPostings.push(post);
    await company.save();
    res.status(201).json({ message: 'Internship post created', post });
  } catch (error) {
    console.error('Create internship post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all internship posts for the logged-in company
router.get('/internships', authenticate, authorizeApprovedCompany, async (req, res) => {
  try {
    const company = await Company.findById(req.user._id).select('internshipPostings');
    if (!company) return res.status(404).json({ message: 'Company not found' });
    res.json(company.internshipPostings.sort((a, b) => b.createdAt - a.createdAt));
  } catch (error) {
    console.error('Get company internship posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update an internship post (company can edit their own posts)
router.put('/internships/:postId', authenticate, authorizeApprovedCompany, async (req, res) => {
  try {
    const { postId } = req.params;
    const company = await Company.findById(req.user._id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    
    const post = company.internshipPostings.id(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Update fields
    Object.assign(post, req.body);
    await company.save();
    
    res.json({ message: 'Post updated successfully', post });
  } catch (error) {
    console.error('Update internship post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete an internship post (company can delete their own posts)
router.delete('/internships/:postId', authenticate, authorizeApprovedCompany, async (req, res) => {
  try {
    const { postId } = req.params;
    const company = await Company.findById(req.user._id);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    
    const post = company.internshipPostings.id(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    // Use pull to remove the post from the array
    company.internshipPostings.pull(postId);
    await company.save();
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete internship post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all active internship posts (for homepage 'Posts' section, last 2 days)
router.get('/all-internships', async (req, res) => {
  try {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const companies = await Company.find({ 'internshipPostings.createdAt': { $gte: twoDaysAgo } })
      .select('name industry website description location size profilePicture internshipPostings');
    // Flatten posts and filter by date
    let posts = [];
    companies.forEach(company => {
      company.internshipPostings.forEach(post => {
        if (post.createdAt >= twoDaysAgo && post.isActive) {
          posts.push({
            ...post.toObject(),
            companyProfile: {
              name: company.name,
              industry: company.industry,
              website: company.website,
              description: company.description,
              location: company.location,
              size: company.size,
              profilePicture: company.profilePicture,
              companyId: company._id
            }
          });
        }
      });
    });
    // Sort by createdAt descending
    posts.sort((a, b) => b.createdAt - a.createdAt);
    res.json(posts);
  } catch (error) {
    console.error('Get all internship posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get interview by ID (moved to end to prevent route conflicts)
router.get('/interview/:id', authenticate, async (req, res) => {
  try {
    const interviewId = req.params.id;

    const company = await Company.findById(req.user._id)
      .select('interviews')
      .populate('interviews.studentId', 'name');

    const interview = company.interviews.id(interviewId);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    console.error('Get interview by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Report a student (by company)
router.post('/report', authenticate, authorizeApprovedCompany, async (req, res) => {
  try {
    const { studentId, interviewId, reason } = req.body || {};
    if (!studentId) {
      return res.status(400).json({ message: 'studentId is required' });
    }

    const [company, student] = await Promise.all([
      Company.findById(req.user._id).select('name'),
      Student.findById(studentId).select('name')
    ]);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const report = await Report.create({
      companyId: req.user._id,
      companyName: company?.name || 'Unknown Company',
      studentId,
      studentName: student.name,
      interviewId: interviewId || undefined,
      reason: reason || 'Reported by company'
    });

    return res.status(201).json({ message: 'Student reported successfully', report });
  } catch (error) {
    console.error('Report student error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;