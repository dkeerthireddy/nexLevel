import nodemailer from 'nodemailer';
import { decryptSensitiveData } from './auth.js';

/**
 * Email Service for StreakMate App
 */

// Create transporter with user's credentials
function createUserTransporter(gmailUser, encryptedGmailAppPassword, userId) {
  if (!gmailUser || !encryptedGmailAppPassword || !userId) {
    console.log('⚠️ Email credentials not provided');
    return null;
  }
  
  try {
    // Decrypt the password using user-specific key
    const gmailAppPassword = decryptSensitiveData(encryptedGmailAppPassword, userId);
    
    if (!gmailAppPassword) {
      console.log('⚠️ Failed to decrypt email password');
      return null;
    }
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword
      }
    });
  } catch (error) {
    console.error('⚠️ Error creating email transporter:', error.message);
    return null;
  }
}

/**
 * Send challenge invitation email (using user's email config)
 */
export async function sendChallengeInvitationEmail(recipientEmail, inviterName, challengeName, challengeDescription, inviteMessage = '', senderEmailConfig = null, senderId = null) {
  try {
    if (!senderEmailConfig || !senderEmailConfig.enabled) {
      console.log('⚠️ Email not sent - sender has not enabled email notifications');
      return { success: false, error: 'Email not configured' };
    }

    const transport = createUserTransporter(senderEmailConfig.gmailUser, senderEmailConfig.gmailAppPassword, senderId);
    if (!transport) {
      return { success: false, error: 'Invalid email configuration' };
    }
    
    const mailOptions = {
      from: `"${inviterName} via ${process.env.APP_NAME || 'StreakMate'}" <${senderEmailConfig.gmailUser}>`,
      to: recipientEmail,
      subject: `🎯 ${inviterName} invited you to join "${challengeName}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .challenge-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Challenge Invitation</h1>
            </div>
            <div class="content">
              <h2>Hi there!</h2>
              <p><strong>${inviterName}</strong> has invited you to join a challenge on the StreakMate.</p>
              
              ${inviteMessage ? `<p style="background: #fff; padding: 15px; border-radius: 5px; font-style: italic;">"${inviteMessage}"</p>` : ''}
              
              <div class="challenge-box">
                <h3>${challengeName}</h3>
                <p>${challengeDescription}</p>
              </div>
              
              <p>Join ${inviterName} and stay accountable together! Challenge each other, track progress, and achieve your goals as a team.</p>
              
              <center>
                <a href="${process.env.APP_URL || 'http://localhost:5173'}/signup" class="button">Join the Challenge</a>
              </center>
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Already have an account? <a href="${process.env.APP_URL || 'http://localhost:5173'}/login">Log in</a> and browse challenges to join.
              </p>
            </div>
            <div class="footer">
              <p>This email was sent by the StreakMate</p>
              <p>If you didn't expect this email, you can safely ignore it.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transport.sendMail(mailOptions);
    console.log('✅ Challenge invitation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending challenge invitation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send challenge invitation email using admin email settings
 * This is used for inviting friends to challenges and works for all users
 */
export async function sendChallengeInvitationEmailAdmin(recipientEmail, inviterName, challengeName, challengeDescription, inviteMessage = '') {
  try {
    // Use admin email settings from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminEmailPassword = process.env.ADMIN_EMAIL_PASSWORD;

    if (!adminEmail || !adminEmailPassword) {
      console.log('⚠️ Admin email not configured - skipping challenge invitation email');
      throw new Error('Admin email not configured');
    }

    // Create transporter with admin credentials
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: adminEmail,
        pass: adminEmailPassword
      }
    });

    const appUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'StreakMate'}" <${adminEmail}>`,
      to: recipientEmail,
      subject: `🎯 ${inviterName} invited you to join "${challengeName}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .challenge-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #06b6d4; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #06b6d4 0%, #2563eb 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎯 Challenge Invitation</h1>
            </div>
            <div class="content">
              <h2>Hi there!</h2>
              <p><strong>${inviterName}</strong> has invited you to join a challenge on StreakMate.</p>
              
              ${inviteMessage ? `<p style="background: #fff; padding: 15px; border-radius: 5px; font-style: italic; border-left: 3px solid #06b6d4;">"${inviteMessage}"</p>` : ''}
              
              <div class="challenge-box">
                <h3 style="color: #0891b2; margin-top: 0;">${challengeName}</h3>
                <p style="margin-bottom: 0;">${challengeDescription}</p>
              </div>
              
              <p>Join ${inviterName} and stay accountable together! Challenge each other, track progress, and achieve your goals as a team.</p>
              
              <center>
                <a href="${appUrl}/signup" class="button">Join the Challenge</a>
              </center>
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Already have an account? <a href="${appUrl}/login" style="color: #0891b2;">Log in</a> and browse challenges to join.
              </p>
            </div>
            <div class="footer">
              <p>This email was sent by StreakMate</p>
              <p>If you didn't expect this email, you can safely ignore it.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transport.sendMail(mailOptions);
    console.log('✅ Challenge invitation email sent to:', recipientEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending challenge invitation email:', error);
    throw new Error('Failed to send challenge invitation email');
  }
}

/**
 * Send notification email
 */
export async function sendNotificationEmail(recipientEmail, recipientName, notification, recipientEmailConfig = null, recipientId = null) {
  try {
    if (!recipientEmailConfig || !recipientEmailConfig.enabled) {
      console.log('⚠️ Email not sent - recipient has not enabled email notifications');
      return { success: false, error: 'Email not configured' };
    }

    const transport = createUserTransporter(recipientEmailConfig.gmailUser, recipientEmailConfig.gmailAppPassword, recipientId);
    if (!transport) {
      return { success: false, error: 'Invalid email configuration' };
    }
    
    // Map notification types to friendly titles and emojis
    const notificationTitles = {
      daily_motivation: '🌟 Daily Motivation',
      friend_progress: '🎉 Friend Activity',
      streak_milestone: '🔥 Streak Milestone',
      challenge_suggestion: '💡 New Challenge Suggestion',
      friend_suggestion: '👥 Friend Suggestion',
      partner_checkin: '✅ Partner Check-in',
      partner_completed: '✅ Partner Completed Task',
      challenge_reminder: '⏰ Challenge Reminder',
      challenge_invitation: '🎯 Challenge Invitation',
      challenge_exit: '👋 Challenge Update'
    };
    
    const subject = notificationTitles[notification.type] || '🔔 Notification';
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'StreakMate'}" <${recipientEmailConfig.gmailUser}>`,
      to: recipientEmail,
      subject: `${subject} - ${notification.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .notification-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>${subject}</h2>
            </div>
            <div class="content">
              <h3>${notification.title}</h3>
              <div class="notification-box">
                <p>${notification.message}</p>
              </div>
              
              <center>
                <a href="${process.env.APP_URL || 'http://localhost:5173'}/dashboard" class="button">View Dashboard</a>
              </center>
            </div>
            <div class="footer">
              <p>This email was sent by the StreakMate</p>
              <p><a href="${process.env.APP_URL || 'http://localhost:5173'}/settings">Manage notification settings</a></p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transport.sendMail(mailOptions);
    console.log('✅ Notification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending notification email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send challenge exit notification email
 */
export async function sendChallengeExitEmail(recipientEmail, recipientName, challengeName, partnerName, reason, recipientEmailConfig = null, recipientId = null) {
  try {
    if (!recipientEmailConfig || !recipientEmailConfig.enabled) {
      console.log('⚠️ Email not sent - recipient has not enabled email notifications');
      return { success: false, error: 'Email not configured' };
    }

    const transport = createUserTransporter(recipientEmailConfig.gmailUser, recipientEmailConfig.gmailAppPassword, recipientId);
    if (!transport) {
      return { success: false, error: 'Invalid email configuration' };
    }
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'StreakMate'}" <${recipientEmailConfig.gmailUser}>`,
      to: recipientEmail,
      subject: `👋 ${partnerName} has left the challenge "${challengeName}"`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #667eea; border-radius: 5px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>👋 Challenge Update</h2>
            </div>
            <div class="content">
              <h3>A partner has left the challenge</h3>
              <div class="info-box">
                <p><strong>${partnerName}</strong> has exited the challenge <strong>"${challengeName}"</strong>.</p>
                ${reason ? `<p style="margin-top: 15px;"><em>Reason: ${reason}</em></p>` : ''}
              </div>
              
              <p>Don't let this discourage you! You can continue the challenge on your own or invite new friends to join you.</p>
              
              <center>
                <a href="${process.env.APP_URL || 'http://localhost:5173'}/challenges" class="button">View Your Challenges</a>
              </center>
            </div>
            <div class="footer">
              <p>This email was sent by the StreakMate</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transport.sendMail(mailOptions);
    console.log('✅ Challenge exit email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending challenge exit email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email using admin email settings
 * This is used for password resets and doesn't require user to have configured email
 */
export async function sendPasswordResetEmail(recipientEmail, recipientName, resetToken) {
  try {
    // Use admin email settings from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminEmailPassword = process.env.ADMIN_EMAIL_PASSWORD;

    if (!adminEmail || !adminEmailPassword) {
      console.log('⚠️ Admin email not configured - skipping password reset email');
      return { success: false, error: 'Admin email not configured' };
    }

    // Create transporter with admin credentials
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: adminEmail,
        pass: adminEmailPassword
      }
    });

    const appUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'StreakMate'}" <${adminEmail}>`,
      to: recipientEmail,
      subject: '🔐 Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">Password Reset Request</h2>
          <p>Hi ${recipientName},</p>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          
          <a href="${resetUrl}" style="display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Reset Password
          </a>
          
          <p style="color: #6B7280; font-size: 14px;">⏰ This link will expire in 1 hour.</p>
          <p style="color: #6B7280; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          
          <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          <p style="color: #9CA3AF; font-size: 12px;">
            Or copy and paste this link: <br>
            <a href="${resetUrl}" style="color: #4F46E5;">${resetUrl}</a>
          </p>
        </div>
      `
    };

    await transport.sendMail(mailOptions);
    console.log('✅ Password reset email sent to:', recipientEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * Send email verification email (old token-based - deprecated)
 */
export async function sendEmailVerificationEmail(recipientEmail, recipientName, verificationToken, recipientEmailConfig = null, recipientId = null) {
  try {
    if (!recipientEmailConfig || !recipientEmailConfig.enabled) {
      console.log('⚠️ Email not sent - recipient has not enabled email notifications');
      return { success: false, error: 'Email not configured' };
    }

    const transport = createUserTransporter(recipientEmailConfig.gmailUser, recipientEmailConfig.gmailAppPassword, recipientId);
    if (!transport) {
      return { success: false, error: 'Invalid email configuration' };
    }

    const appUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verifyUrl = `${appUrl}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'StreakMate'}" <${recipientEmailConfig.gmailUser}>`,
      to: recipientEmail,
      subject: '✉️ Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to StreakMate! 🎉</h2>
          <p>Hi ${recipientName},</p>
          <p>Please verify your email address to complete your registration and unlock all features:</p>
          
          <a href="${verifyUrl}" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Verify Email Address
          </a>
          
          <p style="color: #6B7280; font-size: 14px;">This link will expire in 24 hours.</p>
          
          <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          <p style="color: #9CA3AF; font-size: 12px;">
            Or copy and paste this link: <br>
            <a href="${verifyUrl}" style="color: #4F46E5;">${verifyUrl}</a>
          </p>
        </div>
      `
    };

    await transport.sendMail(mailOptions);
    console.log('✅ Email verification sent to:', recipientEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email verification:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send signup verification code email using admin email settings
 * This is used during signup and doesn't require user to have configured email
 */
export async function sendSignupVerificationEmail(recipientEmail, recipientName, verificationCode) {
  try {
    // Use admin email settings from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminEmailPassword = process.env.ADMIN_EMAIL_PASSWORD;

    if (!adminEmail || !adminEmailPassword) {
      console.log('⚠️ Admin email not configured - skipping verification email');
      return { success: false, error: 'Admin email not configured' };
    }

    // Create transporter with admin credentials
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: adminEmail,
        pass: adminEmailPassword
      }
    });

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'StreakMate'}" <${adminEmail}>`,
      to: recipientEmail,
      subject: '🔐 Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">Welcome to StreakMate! 🎉</h2>
          <p>Hi ${recipientName},</p>
          <p>Thank you for signing up! Please use the verification code below to verify your email address:</p>
          
          <div style="background: #F3F4F6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${verificationCode}
            </div>
          </div>
          
          <p style="color: #6B7280; font-size: 14px;">⏰ This code will expire in 15 minutes.</p>
          
          <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="color: #9CA3AF; font-size: 12px;">
            If you didn't create an account, you can safely ignore this email.
          </p>
        </div>
      `
    };

    await transport.sendMail(mailOptions);
    console.log('✅ Signup verification code sent to:', recipientEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending signup verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * Send password change verification code email using admin email settings
 * This is used when user wants to change password from settings
 */
export async function sendPasswordChangeEmail(recipientEmail, recipientName, verificationCode) {
  try {
    // Use admin email settings from environment variables
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminEmailPassword = process.env.ADMIN_EMAIL_PASSWORD;

    if (!adminEmail || !adminEmailPassword) {
      console.log('⚠️ Admin email not configured - skipping password change email');
      return { success: false, error: 'Admin email not configured' };
    }

    // Create transporter with admin credentials
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: adminEmail,
        pass: adminEmailPassword
      }
    });

    const mailOptions = {
      from: `"${process.env.APP_NAME || 'StreakMate'}" <${adminEmail}>`,
      to: recipientEmail,
      subject: '🔐 Password Change Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">Password Change Request</h2>
          <p>Hi ${recipientName},</p>
          <p>You requested to change your password. Please use the verification code below to confirm this change:</p>
          
          <div style="background: #F3F4F6; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
            <div style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${verificationCode}
            </div>
          </div>
          
          <p style="color: #6B7280; font-size: 14px;">⏰ This code will expire in 15 minutes.</p>
          
          <hr style="border: 0; border-top: 1px solid #E5E7EB; margin: 30px 0;">
          
          <p style="color: #9CA3AF; font-size: 12px;">
            If you didn't request this password change, you can safely ignore this email. Your password will not be changed.
          </p>
        </div>
      `
    };

    await transport.sendMail(mailOptions);
    console.log('✅ Password change verification code sent to:', recipientEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending password change email:', error);
    throw new Error('Failed to send password change email');
  }
}

export default {
  sendChallengeInvitationEmail,
  sendChallengeInvitationEmailAdmin,
  sendNotificationEmail,
  sendChallengeExitEmail,
  sendPasswordResetEmail,
  sendEmailVerificationEmail,
  sendSignupVerificationEmail,
  sendPasswordChangeEmail
};
