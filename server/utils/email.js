import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendInterviewEmail = async (studentEmail, studentName, companyName, interviewDate, interviewTime, roomId) => {
  const mailOptions = {
    from: `"Internship Finder" <${process.env.EMAIL_USER}>`,
    to: studentEmail,
    subject: `Interview Scheduled - ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Interview Invitation</h2>
        <p>Dear ${studentName},</p>
        <p>Congratulations! You have been selected for an interview with <strong>${companyName}</strong>.</p>
        
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #374151;">Interview Details:</h3>
          <p><strong>Company:</strong> ${companyName}</p>
          <p><strong>Date:</strong> ${new Date(interviewDate).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${interviewTime}</p>
          <p><strong>Room ID:</strong> ${roomId}</p>
        </div>
        
        <p>Please log in to your account to access the interview room at the scheduled time.</p>
        <p>Make sure to test your camera and microphone before the interview.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/login" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login to Your Account
          </a>
        </div>
        
        <p>Good luck with your interview!</p>
        <p>Best regards,<br>The Internship Finder Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Interview email sent successfully');
  } catch (error) {
    console.error('Error sending interview email:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (email, name, userType) => {
  const mailOptions = {
    from: `"Internship Finder" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Internship Finder!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to Internship Finder!</h2>
        <p>Dear ${name},</p>
        <p>Thank you for registering as a ${userType} on Internship Finder.</p>
        ${userType === 'company' ? 
          '<p>Your account is currently under review. You will be notified once approved by our admin team.</p>' :
          '<p>You can now complete your profile and start exploring internship opportunities!</p>'
        }
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL}/login" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Login to Your Account
          </a>
        </div>
        <p>Best regards,<br>The Internship Finder Team</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};