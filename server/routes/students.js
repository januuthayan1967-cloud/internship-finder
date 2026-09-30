import express from 'express';
import { body, validationResult } from 'express-validator';
import Student from '../models/Student.js';
import { authenticate, authorizeStudent } from '../middleware/auth.js';
import { uploadFiles } from '../middleware/upload.js';

const router = express.Router();

// Get student profile
router.get('/profile', authenticate, authorizeStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id)
      .select('-password')
      .populate('interviews.companyId', 'name');
    
    res.json(student);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete profile step 1 (Questions)
router.post('/profile/questions', [
  authenticate,
  authorizeStudent,
  body('experienceLevel').isInt({ min: 0, max: 10 }).withMessage('Experience level must be 0-10'),
  body('programmingLanguages').isArray({ min: 1 }).withMessage('At least one programming language required'),
  body('preferredDomains').isArray({ min: 1 }).withMessage('At least one preferred domain required')
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

    const student = await Student.findById(req.user._id);
    
    student.experienceLevel = experienceLevel;
    student.programmingLanguages = programmingLanguages;
    student.preferredDomains = preferredDomains;
    
    student.checkProfileCompletion();
    await student.save();

    res.json({
      message: 'Profile questions updated successfully',
      profileCompleted: student.profileCompleted
    });
  } catch (error) {
    console.error('Update questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload files (CV and Profile Picture)
router.post('/profile/upload', [
  authenticate,
  authorizeStudent,
  uploadFiles
], async (req, res) => {
  try {
    if (!req.files || (!req.files.cv && !req.files.profilePicture)) {
      return res.status(400).json({ message: 'At least one file is required' });
    }

    const student = await Student.findById(req.user._id);

    // Normalize stored paths to web-accessible URLs under /uploads
    if (req.files.cv && req.files.cv[0]) {
      const cvFilename = req.files.cv[0].filename;
      student.cvPath = `/cvs/${cvFilename}`; // client should prefix with /uploads
    }

    if (req.files.profilePicture && req.files.profilePicture[0]) {
      const picFilename = req.files.profilePicture[0].filename;
      student.profilePicturePath = `/profiles/${picFilename}`; // client should prefix with /uploads
    }

    student.checkProfileCompletion();
    await student.save();

    res.json({
      message: 'Files uploaded successfully',
      profileCompleted: student.profileCompleted,
      cvPath: student.cvPath,
      profilePicturePath: student.profilePicturePath
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Server error during file upload' });
  }
});

// Update profile
router.put('/profile', [
  authenticate,
  authorizeStudent,
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('phone').optional().matches(/^\d{10}$/),
  body('university').optional().trim().isLength({ min: 2 }),
  body('experienceLevel').optional().isInt({ min: 0, max: 10 }),
  body('programmingLanguages').optional().isArray({ min: 1 }),
  body('preferredDomains').optional().isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updates = req.body;
    const student = await Student.findById(req.user._id);

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        student[key] = updates[key];
      }
    });

    student.checkProfileCompletion();
    await student.save();

    const updatedStudent = await Student.findById(student._id).select('-password');
    
    res.json({
      message: 'Profile updated successfully',
      student: updatedStudent
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notifications
router.get('/notifications', authenticate, authorizeStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select('notifications');
    
    res.json(student.notifications.sort((a, b) => b.createdAt - a.createdAt));
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', authenticate, authorizeStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    const notification = student.notifications.id(req.params.notificationId);
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await student.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get interviews
router.get('/interviews', authenticate, authorizeStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id)
      .select('interviews')
      .populate('interviews.companyId', 'name');
    
    res.json(student.interviews.sort((a, b) => b.createdAt - a.createdAt));
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get missed interviews
router.get('/missed-interviews', authenticate, authorizeStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id)
      .select('missedInterviews')
      .populate('missedInterviews.companyId', 'name');
    
    res.json(student.missedInterviews.sort((a, b) => b.missedAt - a.missedAt));
  } catch (error) {
    console.error('Get missed interviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get interview by ID
router.get('/interview/:id', authenticate, async (req, res) => {
  try {
    const interviewId = req.params.id;

    const student = await Student.findById(req.user._id)
      .select('interviews')
      .populate('interviews.companyId', 'name');

    const interview = student.interviews.id(interviewId);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json(interview);
  } catch (error) {
    console.error('Get interview by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark interview as joined
router.put('/interview/:id/join', authenticate, authorizeStudent, async (req, res) => {
  try {
    const interviewId = req.params.id;
    const student = await Student.findById(req.user._id);
    const interview = student.interviews.id(interviewId);

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    if (interview.status !== 'scheduled') {
      return res.status(400).json({ message: 'Interview is not scheduled' });
    }

    // Mark as joined
    interview.joined = true;
    interview.joinedAt = new Date();
    
    await student.save();

    res.json({ 
      message: 'Interview marked as joined',
      interview: {
        id: interview._id,
        companyName: interview.companyName,
        joined: interview.joined,
        joinedAt: interview.joinedAt
      }
    });
  } catch (error) {
    console.error('Mark interview as joined error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
 
// Delete own profile (student self-delete)
// This will permanently delete the student account
// Consider switching to a soft delete if retention is required
router.delete('/profile', authenticate, authorizeStudent, async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    await Student.findByIdAndDelete(req.user._id);
    return res.json({ message: 'Student account deleted successfully' });
  } catch (error) {
    console.error('Delete student profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});