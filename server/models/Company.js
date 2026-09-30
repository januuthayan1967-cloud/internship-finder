import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  profilePicture: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    required: [true, 'Company size is required']
  },
  // Admin approval
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  // Profile status
  isActive: {
    type: Boolean,
    default: true
  },
  deletedAt: Date,
  // Internship postings
  internshipPostings: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      trim: true
    },
    requirements: {
      experienceLevel: {
        type: Number,
        min: 0,
        max: 10,
        required: true
      },
      programmingLanguages: [{
        type: String,
        enum: ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Other']
      }],
      preferredDomains: [{
        type: String,
        enum: ['Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'AI', 'Cybersecurity', 'Cloud Computing', 'DevOps', 'UI/UX Design', 'Game Development', 'Other']
      }]
    },
    duration: {
      type: String,
      required: true
    },
    stipend: {
      type: String
    },
    location: {
      type: String,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    applications: [{
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      appliedAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['applied', 'shortlisted', 'interview_scheduled', 'rejected', 'selected'],
        default: 'applied'
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Interview management
  interviews: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    internshipId: mongoose.Schema.Types.ObjectId,
    scheduledDate: Date,
    scheduledTime: String,
    round: {
      type: Number,
      default: 1,
      min: 1,
      max: 3
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled'],
      default: 'scheduled'
    },
    roomId: String,
    feedback: String,
    joined: {
      type: Boolean,
      default: false
    },
    joinedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
companySchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
companySchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('Company', companySchema);