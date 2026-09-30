import cron from 'node-cron';
import Student from '../models/Student.js';
import Company from '../models/Company.js';

/**
 * Clean up expired interviews that weren't joined by students
 * This function removes interview entries that are past their scheduled time
 * and haven't been marked as joined or completed
 */
export const cleanupExpiredInterviews = async () => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // Get current time in HH:MM:SS format
    
    console.log(`🕐 Running interview cleanup at ${now.toISOString()}`);
    
    // Find all students with scheduled interviews that are past their time
    const students = await Student.find({
      'interviews.status': 'scheduled',
      'interviews.scheduledDate': { $lte: now }
    });
    
    let deletedCount = 0;
    
    for (const student of students) {
      const interviewsToRemove = [];
      
      for (let i = student.interviews.length - 1; i >= 0; i--) {
        const interview = student.interviews[i];
        
        // Check if interview is scheduled and past its time
        if (interview.status === 'scheduled') {
          const interviewDate = new Date(interview.scheduledDate);
          const interviewTime = interview.scheduledTime;
          
          // If the interview date is today and time has passed, or if it's a past date
          const isExpired = interviewDate < now || 
            (interviewDate.toDateString() === now.toDateString() && interviewTime < currentTime);
          
          // Only delete if student didn't join the interview
          if (isExpired && !interview.joined) {
            console.log(`🗑️ Moving expired interview to missed interviews for student ${student._id}: ${interview.companyName} at ${interview.scheduledDate} ${interview.scheduledTime}`);
            
            // Store in missed interviews before removing
            student.missedInterviews.push({
              companyId: interview.companyId,
              companyName: interview.companyName,
              scheduledDate: interview.scheduledDate,
              scheduledTime: interview.scheduledTime,
              round: interview.round,
              roomId: interview.roomId,
              reason: 'expired',
              missedAt: new Date()
            });
            
            // Add to removal list
            interviewsToRemove.push(i);
            deletedCount++;
            
            // Also remove from company's interview list
            if (interview.companyId) {
              await Company.updateOne(
                { _id: interview.companyId },
                { $pull: { interviews: { studentId: student._id, roomId: interview.roomId } } }
              );
              
              console.log(`🗑️ Removed interview from company ${interview.companyId} for student ${student._id}`);
            }
          }
        }
      }
      
      // Remove expired interviews from student
      interviewsToRemove.forEach(index => {
        student.interviews.splice(index, 1);
      });
      
      if (interviewsToRemove.length > 0) {
        await student.save();
      }
    }
    
    console.log(`✅ Interview cleanup completed. Removed ${deletedCount} expired interviews.`);
    return deletedCount;
    
  } catch (error) {
    console.error('❌ Error during interview cleanup:', error);
    throw error;
  }
};

/**
 * Initialize the cron job to run interview cleanup every 5 minutes
 */
export const initializeInterviewCleanup = () => {
  // Run cleanup every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      await cleanupExpiredInterviews();
    } catch (error) {
      console.error('❌ Cron job error during interview cleanup:', error);
    }
  });
  
  console.log('🔄 Interview cleanup cron job initialized (runs every 5 minutes)');
};

/**
 * Manual cleanup function that can be called on demand
 */
export const manualCleanup = async () => {
  try {
    const deletedCount = await cleanupExpiredInterviews();
    return { success: true, deletedCount };
  } catch (error) {
    console.error('❌ Manual cleanup error:', error);
    return { success: false, error: error.message };
  }
}; 