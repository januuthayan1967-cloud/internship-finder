import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
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
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  university: {
    type: String,
    required: [true, 'University is required'],
    trim: true
  },
  // Profile completion fields
  experienceLevel: {
    type: Number,
    min: 0,
    max: 10
  },
  programmingLanguages: [{
    type: String,
    enum: ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'TypeScript', 'React', 'Angular', 'Vue', 'Node.js', 'Other']
  }],
  preferredDomains: [{
    type: String,
    enum: ['Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'AI', 'Cybersecurity', 'Cloud Computing', 'DevOps', 'UI/UX Design', 'Game Development', 'Other']
  }],
  cvPath: {
    type: String
  },
  profilePicturePath: {
    type: String
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  // Interview tracking
  interviews: [{
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    companyName: String,
    status: {
      type: String,
      enum: ['pending', 'scheduled', 'completed', 'cancelled'],
      default: 'pending'
    },
    scheduledDate: Date,
    scheduledTime: String,
    round: {
      type: Number,
      default: 1,
      min: 1,
      max: 3
    },
    roomId: String,
    notes: String,
    joined: {
      type: Boolean,
      default: false
    },
    joinedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Missed interviews tracking
  missedInterviews: [{
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company'
    },
    companyName: String,
    scheduledDate: Date,
    scheduledTime: String,
    round: {
      type: Number,
      default: 1,
      min: 1,
      max: 3
    },
    roomId: String,
    reason: {
      type: String,
      enum: ['expired', 'no_show', 'cancelled'],
      default: 'expired'
    },
    missedAt: {
      type: Date,
      default: Date.now
    }
  }],
  notifications: [{
    message: String,
    type: {
      type: String,
      enum: ['interview', 'general', 'profile'],
      default: 'general'
    },
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
studentSchema.pre('save', async function(next) {
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
studentSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

// Check if profile is complete
studentSchema.methods.checkProfileCompletion = function() {
  const required = [
    this.experienceLevel !== undefined,
    this.programmingLanguages && this.programmingLanguages.length > 0,
    this.preferredDomains && this.preferredDomains.length > 0,
    this.cvPath,
    this.profilePicturePath
  ];
  
  this.profileCompleted = required.every(field => field);
  return this.profileCompleted;
};

export default mongoose.model('Student', studentSchema);