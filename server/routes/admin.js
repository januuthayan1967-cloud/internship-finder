import express from 'express';
import Company from '../models/Company.js';
import Student from '../models/Student.js';
import Admin from '../models/Admin.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';
import { manualCleanup } from '../utils/interviewCleanup.js';
import Report from '../models/Report.js';

const router = express.Router();

// Get pending companies for approval
router.get('/companies/pending', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const pendingCompanies = await Company.find({ isApproved: false })
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(pendingCompanies);
  } catch (error) {
    console.error('Get pending companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve company
router.put('/companies/:companyId/approve', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    company.isApproved = true;
    company.approvedAt = new Date();
    company.approvedBy = req.user._id;
    
    await company.save();

    // TODO: Send approval email to company

    res.json({
      message: 'Company approved successfully',
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        isApproved: company.isApproved,
        approvedAt: company.approvedAt
      }
    });
  } catch (error) {
    console.error('Approve company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject company
router.delete('/companies/:companyId/reject', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    await Company.findByIdAndDelete(req.params.companyId);

    // TODO: Send rejection email to company

    res.json({ message: 'Company rejected and removed successfully' });
  } catch (error) {
    console.error('Reject company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all approved companies
router.get('/companies/approved', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const approvedCompanies = await Company.find({ isApproved: true })
      .select('-password')
      .sort({ approvedAt: -1 });
    
    res.json(approvedCompanies);
  } catch (error) {
    console.error('Get approved companies error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete approved company
router.delete('/companies/:companyId/delete', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const company = await Company.findById(req.params.companyId);
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (!company.isApproved) {
      return res.status(400).json({ message: 'Can only delete approved companies' });
    }

    await Company.findByIdAndDelete(req.params.companyId);

    // TODO: Send deletion notification email to company

    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all students
router.get('/students', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const students = await Student.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(students);
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get student by ID
router.get('/students/:studentId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .select('-password');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student
router.put('/students/:studentId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { name, email, university, experienceLevel, profileCompleted, skills, interests } = req.body;
    
    const student = await Student.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update fields
    if (name) student.name = name;
    if (email) student.email = email;
    if (university) student.university = university;
    if (experienceLevel !== undefined) student.experienceLevel = experienceLevel;
    if (profileCompleted !== undefined) student.profileCompleted = profileCompleted;
    if (skills) student.skills = skills;
    if (interests) student.interests = interests;

    await student.save();

    res.json({
      message: 'Student updated successfully',
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        university: student.university,
        experienceLevel: student.experienceLevel,
        profileCompleted: student.profileCompleted
      }
    });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete student
router.delete('/students/:studentId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await Student.findByIdAndDelete(req.params.studentId);

    // TODO: Send deletion notification email to student

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update students
router.put('/students/bulk/update', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { studentIds, updates } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Student IDs array is required' });
    }

    const result = await Student.updateMany(
      { _id: { $in: studentIds } },
      { $set: updates }
    );

    res.json({
      message: `${result.modifiedCount} students updated successfully`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk update students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk delete students
router.delete('/students/bulk/delete', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { studentIds } = req.body;
    
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: 'Student IDs array is required' });
    }

    const result = await Student.deleteMany({ _id: { $in: studentIds } });

    res.json({
      message: `${result.deletedCount} students deleted successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Bulk delete students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats
router.get('/stats', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const [
      totalStudents,
      completedProfiles,
      totalCompanies,
      approvedCompanies,
      pendingCompanies
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ profileCompleted: true }),
      Company.countDocuments(),
      Company.countDocuments({ isApproved: true }),
      Company.countDocuments({ isApproved: false })
    ]);

    res.json({
      students: {
        total: totalStudents,
        completedProfiles,
        profileCompletionRate: totalStudents > 0 ? (completedProfiles / totalStudents * 100).toFixed(1) : 0
      },
      companies: {
        total: totalCompanies,
        approved: approvedCompanies,
        pending: pendingCompanies,
        approvalRate: totalCompanies > 0 ? (approvedCompanies / totalCompanies * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Update an internship post
router.put('/internships/:companyId/:postId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { companyId, postId } = req.params;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const post = company.internshipPostings.id(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    // Update fields
    Object.assign(post, req.body);
    await company.save();
    res.json({ message: 'Post updated', post });
  } catch (error) {
    console.error('Admin update internship post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin: Delete an internship post
router.delete('/internships/:companyId/:postId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { companyId, postId } = req.params;
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const post = company.internshipPostings.id(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    post.remove();
    await company.save();
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Admin delete internship post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manual interview cleanup endpoint
router.post('/cleanup-interviews', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await manualCleanup();
    
    if (result.success) {
      res.json({
        message: 'Interview cleanup completed successfully',
        deletedCount: result.deletedCount
      });
    } else {
      res.status(500).json({
        message: 'Interview cleanup failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('Manual interview cleanup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all interview details for admin dashboard
router.get('/interviews', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Get all companies with their interviews
    const companies = await Company.find({ isApproved: true })
      .select('name industry location interviews')
      .populate('interviews.studentId', 'name email university phone')
      .sort({ 'interviews.createdAt': -1 });

    // Get all students with their interviews
    const students = await Student.find()
      .select('name email university phone interviews')
      .populate('interviews.companyId', 'name industry location')
      .sort({ 'interviews.createdAt': -1 });

    // Combine and format interview data
    const allInterviews = [];

    // Process company interviews
    companies.forEach(company => {
      company.interviews.forEach(interview => {
        if (interview.studentId) {
          allInterviews.push({
            id: interview._id,
            type: 'company_initiated',
            company: {
              id: company._id,
              name: company.name,
              industry: company.industry,
              location: company.location
            },
            student: {
              id: interview.studentId._id,
              name: interview.studentId.name,
              email: interview.studentId.email,
              university: interview.studentId.university,
              phone: interview.studentId.phone
            },
            interview: {
              status: interview.status,
              round: interview.round,
              scheduledDate: interview.scheduledDate,
              scheduledTime: interview.scheduledTime,
              roomId: interview.roomId,
              joined: interview.joined,
              joinedAt: interview.joinedAt,
              createdAt: interview.createdAt,
              feedback: interview.feedback
            }
          });
        }
      });
    });

    // Process student interviews
    students.forEach(student => {
      student.interviews.forEach(interview => {
        if (interview.companyId) {
          // Check if this interview is already added from company side
          const exists = allInterviews.find(i => 
            i.company.id === interview.companyId._id && 
            i.student.id === student._id &&
            i.interview.scheduledDate?.getTime() === interview.scheduledDate?.getTime()
          );
          
          if (!exists) {
            allInterviews.push({
              id: interview._id,
              type: 'student_initiated',
              company: {
                id: interview.companyId._id,
                name: interview.companyId.name,
                industry: interview.companyId.industry,
                location: interview.companyId.location
              },
              student: {
                id: student._id,
                name: student.name,
                email: student.email,
                university: student.university,
                phone: student.phone
              },
              interview: {
                status: interview.status,
                round: interview.round,
                scheduledDate: interview.scheduledDate,
                scheduledTime: interview.scheduledTime,
                roomId: interview.roomId,
                joined: interview.joined,
                joinedAt: interview.joinedAt,
                createdAt: interview.createdAt,
                notes: interview.notes
              }
          });
          }
        }
      });
    });

    // Sort by creation date (most recent first)
    allInterviews.sort((a, b) => new Date(b.interview.createdAt) - new Date(a.interview.createdAt));

    res.json({
      total: allInterviews.length,
      interviews: allInterviews
    });
  } catch (error) {
    console.error('Get admin interviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single interview by ID
router.get('/interviews/:interviewId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    // Search in both company and student interviews
    let interview = null;
    let source = null;

    // Check company interviews first
    const company = await Company.findOne({ 'interviews._id': interviewId })
      .populate('interviews.studentId', 'name email university phone');
    
    if (company) {
      const companyInterview = company.interviews.id(interviewId);
      if (companyInterview) {
        interview = {
          id: companyInterview._id,
          type: 'company_initiated',
          company: {
            id: company._id,
            name: company.name,
            industry: company.industry,
            location: company.location
          },
          student: companyInterview.studentId ? {
            id: companyInterview.studentId._id,
            name: companyInterview.studentId.name,
            email: companyInterview.studentId.email,
            university: companyInterview.studentId.university,
            phone: companyInterview.studentId.phone
          } : null,
          interview: {
            status: companyInterview.status,
            round: companyInterview.round,
            scheduledDate: companyInterview.scheduledDate,
            scheduledTime: companyInterview.scheduledTime,
            roomId: companyInterview.roomId,
            joined: companyInterview.joined,
            joinedAt: companyInterview.joinedAt,
            createdAt: companyInterview.createdAt,
            feedback: companyInterview.feedback
          }
        };
        source = { type: 'company', id: company._id, interview: companyInterview };
      }
    }

    // If not found in company interviews, check student interviews
    if (!interview) {
      const student = await Student.findOne({ 'interviews._id': interviewId })
        .populate('interviews.companyId', 'name industry location');
      
      if (student) {
        const studentInterview = student.interviews.id(interviewId);
        if (studentInterview) {
          interview = {
            id: studentInterview._id,
            type: 'student_initiated',
            company: studentInterview.companyId ? {
              id: studentInterview.companyId._id,
              name: studentInterview.companyId.name,
              industry: studentInterview.companyId.industry,
              location: studentInterview.companyId.location
            } : null,
            student: {
              id: student._id,
              name: student.name,
              email: student.email,
              university: student.university,
              phone: student.phone
            },
            interview: {
              status: studentInterview.status,
              round: studentInterview.round,
              scheduledDate: studentInterview.scheduledDate,
              scheduledTime: studentInterview.scheduledTime,
              roomId: studentInterview.roomId,
              joined: studentInterview.joined,
              joinedAt: studentInterview.joinedAt,
              createdAt: studentInterview.createdAt,
              notes: studentInterview.notes
            }
          };
          source = { type: 'student', id: student._id, interview: studentInterview };
        }
      }
    }

    if (!interview) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({ interview, source });
  } catch (error) {
    console.error('Get single interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new interview (admin can schedule interviews)
router.post('/interviews', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { 
      studentId, 
      companyId, 
      scheduledDate, 
      scheduledTime, 
      round = 1, 
      status = 'scheduled',
      roomId,
      notes,
      feedback
    } = req.body;

    // Validate required fields
    if (!studentId || !companyId || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ 
        message: 'Student ID, Company ID, scheduled date and time are required' 
      });
    }

    // Check if student and company exist
    const [student, company] = await Promise.all([
      Student.findById(studentId),
      Company.findById(companyId)
    ]);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    if (!company.isApproved) {
      return res.status(400).json({ message: 'Company must be approved to schedule interviews' });
    }

    // Create interview in company's interview list
    const companyInterview = {
      studentId: studentId,
      scheduledDate: new Date(scheduledDate),
      scheduledTime: scheduledTime,
      round: round,
      status: status,
      roomId: roomId,
      feedback: feedback,
      createdAt: new Date()
    };

    company.interviews.push(companyInterview);
    await company.save();

    // Create interview in student's interview list
    const studentInterview = {
      companyId: companyId,
      companyName: company.name,
      scheduledDate: new Date(scheduledDate),
      scheduledTime: scheduledTime,
      round: round,
      status: status,
      roomId: roomId,
      notes: notes,
      createdAt: new Date()
    };

    student.interviews.push(studentInterview);
    await student.save();

    // Get the created interview with populated data
    const createdInterview = {
      id: companyInterview._id,
      type: 'admin_initiated',
      company: {
        id: company._id,
        name: company.name,
        industry: company.industry,
        location: company.location
      },
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        university: student.university,
        phone: student.phone
      },
      interview: {
        status: companyInterview.status,
        round: companyInterview.round,
        scheduledDate: companyInterview.scheduledDate,
        scheduledTime: companyInterview.scheduledTime,
        roomId: companyInterview.roomId,
        joined: false,
        createdAt: companyInterview.createdAt,
        feedback: companyInterview.feedback,
        notes: studentInterview.notes
      }
    };

    res.status(201).json({
      message: 'Interview scheduled successfully',
      interview: createdInterview
    });
  } catch (error) {
    console.error('Create interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update interview
router.put('/interviews/:interviewId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { interviewId } = req.params;
    const updates = req.body;

    // Find and update in company interviews
    let updated = false;
    const company = await Company.findOne({ 'interviews._id': interviewId });
    
    if (company) {
      const companyInterview = company.interviews.id(interviewId);
      if (companyInterview) {
        // Update company interview
        Object.keys(updates).forEach(key => {
          if (key === 'scheduledDate' && updates[key]) {
            companyInterview[key] = new Date(updates[key]);
          } else if (updates[key] !== undefined) {
            companyInterview[key] = updates[key];
          }
        });
        
        await company.save();
        updated = true;
      }
    }

    // Find and update in student interviews
    const student = await Student.findOne({ 'interviews._id': interviewId });
    
    if (student) {
      const studentInterview = student.interviews.id(interviewId);
      if (studentInterview) {
        // Update student interview
        Object.keys(updates).forEach(key => {
          if (key === 'scheduledDate' && updates[key]) {
            studentInterview[key] = new Date(updates[key]);
          } else if (updates[key] !== undefined) {
            studentInterview[key] = updates[key];
          }
        });
        
        await student.save();
        updated = true;
      }
    }

    if (!updated) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({ message: 'Interview updated successfully' });
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete interview
router.delete('/interviews/:interviewId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    let deleted = false;

    // Delete from company interviews
    const company = await Company.findOne({ 'interviews._id': interviewId });
    if (company) {
      const companyInterview = company.interviews.id(interviewId);
      if (companyInterview) {
        companyInterview.remove();
        await company.save();
        deleted = true;
      }
    }

    // Delete from student interviews
    const student = await Student.findOne({ 'interviews._id': interviewId });
    if (student) {
      const studentInterview = student.interviews.id(interviewId);
      if (studentInterview) {
        studentInterview.remove();
        await student.save();
        deleted = true;
      }
    }

    if (!deleted) {
      return res.status(404).json({ message: 'Interview not found' });
    }

    res.json({ message: 'Interview deleted successfully' });
  } catch (error) {
    console.error('Delete interview error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk update interviews
router.put('/interviews/bulk/update', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { interviewIds, updates } = req.body;
    
    if (!interviewIds || !Array.isArray(interviewIds) || interviewIds.length === 0) {
      return res.status(400).json({ message: 'Interview IDs array is required' });
    }

    if (!updates || Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Updates object is required' });
    }

    let updatedCount = 0;

    // Update company interviews
    const companies = await Company.find({ 'interviews._id': { $in: interviewIds } });
    for (const company of companies) {
      for (const interviewId of interviewIds) {
        const interview = company.interviews.id(interviewId);
        if (interview) {
          Object.keys(updates).forEach(key => {
            if (key === 'scheduledDate' && updates[key]) {
              interview[key] = new Date(updates[key]);
            } else if (updates[key] !== undefined) {
              interview[key] = updates[key];
            }
          });
          updatedCount++;
        }
      }
      await company.save();
    }

    // Update student interviews
    const students = await Student.find({ 'interviews._id': { $in: interviewIds } });
    for (const student of students) {
      for (const interviewId of interviewIds) {
        const interview = student.interviews.id(interviewId);
        if (interview) {
          Object.keys(updates).forEach(key => {
            if (key === 'scheduledDate' && updates[key]) {
              interview[key] = new Date(updates[key]);
            } else if (updates[key] !== undefined) {
              interview[key] = updates[key];
            }
          });
        }
      }
      await student.save();
    }

    res.json({
      message: `${updatedCount} interviews updated successfully`,
      updatedCount
    });
  } catch (error) {
    console.error('Bulk update interviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk delete interviews
router.delete('/interviews/bulk/delete', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { interviewIds } = req.body;
    
    if (!interviewIds || !Array.isArray(interviewIds) || interviewIds.length === 0) {
      return res.status(400).json({ message: 'Interview IDs array is required' });
    }

    let deletedCount = 0;

    // Delete from company interviews
    const companies = await Company.find({ 'interviews._id': { $in: interviewIds } });
    for (const company of companies) {
      for (const interviewId of interviewIds) {
        const interview = company.interviews.id(interviewId);
        if (interview) {
          interview.remove();
          deletedCount++;
        }
      }
      await company.save();
    }

    // Delete from student interviews
    const students = await Student.find({ 'interviews._id': { $in: interviewIds } });
    for (const student of students) {
      for (const interviewId of interviewIds) {
        const interview = student.interviews.id(interviewId);
        if (interview) {
          interview.remove();
        }
      }
      await student.save();
    }

    res.json({
      message: `${deletedCount} interviews deleted successfully`,
      deletedCount
    });
  } catch (error) {
    console.error('Bulk delete interviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get interview statistics
router.get('/interviews/stats', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const [companies, students] = await Promise.all([
      Company.find({ isApproved: true }).select('interviews'),
      Student.find().select('interviews')
    ]);

    let totalInterviews = 0;
    let scheduledInterviews = 0;
    let completedInterviews = 0;
    let cancelledInterviews = 0;
    let pendingInterviews = 0;
    let companyInitiated = 0;
    let studentInitiated = 0;

    // Count company interviews
    companies.forEach(company => {
      company.interviews.forEach(interview => {
        totalInterviews++;
        if (interview.status === 'scheduled') scheduledInterviews++;
        else if (interview.status === 'completed') completedInterviews++;
        else if (interview.status === 'cancelled') cancelledInterviews++;
        else if (interview.status === 'pending') pendingInterviews++;
        companyInitiated++;
      });
    });

    // Count student interviews (avoid double counting)
    students.forEach(student => {
      student.interviews.forEach(interview => {
        // Only count if not already counted from company side
        const exists = companies.some(company => 
          company.interviews.some(ci => 
            ci.studentId?.toString() === student._id.toString() &&
            ci.scheduledDate?.getTime() === interview.scheduledDate?.getTime()
          )
        );
        
        if (!exists) {
          totalInterviews++;
          if (interview.status === 'scheduled') scheduledInterviews++;
          else if (interview.status === 'completed') completedInterviews++;
          else if (interview.status === 'cancelled') cancelledInterviews++;
          else if (interview.status === 'pending') pendingInterviews++;
          studentInitiated++;
        }
      });
    });

    res.json({
      total: totalInterviews,
      scheduled: scheduledInterviews,
      completed: completedInterviews,
      cancelled: cancelledInterviews,
      pending: pendingInterviews,
      companyInitiated,
      studentInitiated,
      completionRate: totalInterviews > 0 ? ((completedInterviews / totalInterviews) * 100).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Get interview stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reports (company -> student)
router.get('/reports', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('companyId', 'name email industry')
      .populate('studentId', 'name email university')
      .sort({ createdAt: -1 });

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a single report
router.delete('/reports/:reportId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    // Delete the reported student account
    if (report.studentId) {
      const student = await Student.findById(report.studentId);
      if (student) {
        await Student.findByIdAndDelete(report.studentId);
      }
    }
    // Delete the report itself
    await Report.findByIdAndDelete(reportId);
    res.json({ message: 'Report deleted and student account removed successfully' });
  } catch (error) {
    console.error('Delete report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
 
// Admin self-delete endpoint
// Permanently deletes the current admin account
router.delete('/profile', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    await Admin.findByIdAndDelete(req.user._id);
    return res.json({ message: 'Admin account deleted successfully' });
  } catch (error) {
    console.error('Delete admin account error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});