import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true
  },
  companyName: {
    type: String,
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  interviewId: {
    type: mongoose.Schema.Types.ObjectId,
  },
  reason: {
    type: String,
    default: 'Reported by company'
  }
}, {
  timestamps: true
});

const Report = mongoose.model('Report', reportSchema);
export default Report;


