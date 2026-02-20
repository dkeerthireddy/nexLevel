import nodemailer from 'nodemailer';
import { decryptSensitiveData } from './auth.js';

/**
 * Email Service for nexLevel App
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
      from: `"${inviterName} via ${process.env.APP_NAME || 'nexLevel'}" <${senderEmailConfig.gmailUser}>`,
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
              <p><strong>${inviterName}</strong> has invited you to join a challenge on nexLevel.</p>
              
              ${inviteMessage ? `<p style="background: #fff; padding: 15px; border-radius: 5px; font-style: italic;">"${inviteMessage}"</p>` : ''}
              
              <div class="challenge-box">
                <h3>${challengeName}</h3>
                <p>${challengeDescription}</p>
              </div>
              
              <p>Join ${inviterName} and stay accountable together! Challenge each other, track progress, and achieve your goals as a team.</p>
              
              <center>
                <a href="${process.env.APP_URL || 'http://localhost:5173'}/browse?join=${challengeId}" class="button">Join the Challenge</a>
              </center>
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Already have an account? <a href="${process.env.APP_URL || 'http://localhost:5173'}/login">Log in</a> and browse challenges to join.
              </p>
            </div>
            <div class="footer">
              <p>This email was sent by nexLevel</p>
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
/**
 * Send user challenge instance invitation email
 * This invites someone to join a SPECIFIC instance of a challenge with the inviter
 */
/**
 * Helper function to send email using admin credentials
 */
async function sendEmailViaAdmin(recipientEmail, subject, htmlContent) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminEmailPassword = process.env.ADMIN_EMAIL_PASSWORD;

  if (!adminEmail || !adminEmailPassword) {
    console.log('⚠️ Admin email not configured - skipping email');
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

  const mailOptions = {
    from: `"${process.env.APP_NAME || 'nexLevel'}" <${adminEmail}>`,
    to: recipientEmail,
    subject: subject,
    html: htmlContent
  };

  await transport.sendMail(mailOptions);
  console.log('✅ Email sent via admin to:', recipientEmail);
}

export async function sendUserChallengeInvitationEmailAdmin(recipientEmail, inviterName, challengeName, challengeDescription, userChallengeId, inviteMessage = '') {
  const appUrl = process.env.APP_URL || 'http://localhost:5173';
  
  const subject = `${inviterName} invited you to join their challenge: ${challengeName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .message-box { background: white; padding: 15px; border-left: 4px solid #06b6d4; margin: 20px 0; border-radius: 5px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Challenge Invitation</h1>
        </div>
        <div class="content">
          <h2>Hi there!</h2>
          <p><strong>${inviterName}</strong> has invited you to join their challenge instance on nexLevel!</p>
          
          <h3>📋 Challenge: ${challengeName}</h3>
          <p>${challengeDescription}</p>
          
          ${inviteMessage ? `
          <div class="message-box">
            <p><strong>Personal message from ${inviterName}:</strong></p>
            <p><em>"${inviteMessage}"</em></p>
          </div>
          ` : ''}
          
          <p><strong>When you join, you'll:</strong></p>
          <ul>
            <li>Become accountability partners with ${inviterName}</li>
            <li>Be automatically added as friends</li>
            <li>Get notifications when they check in</li>
            <li>Track progress together!</li>
          </ul>
          
          <center>
            <a href="${appUrl}/join-instance/${userChallengeId}" class="button">Join ${inviterName}'s Challenge</a>
          </center>
          
          <div class="footer">
            <p>This invitation is specifically for ${inviterName}'s challenge instance.</p>
            <p>You'll both be working on the same challenge together as streak partners!</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await sendEmailViaAdmin(recipientEmail, subject, html);
    console.log(`✅ User challenge invitation email sent to ${recipientEmail}`);
  } catch (error) {
    console.error('❌ Error sending user challenge invitation email:', error);
    throw error;
  }
}

export async function sendChallengeInvitationEmailAdmin(recipientEmail, inviterName, challengeName, challengeDescription, challengeId, inviteMessage = '') {
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
      from: `"${process.env.APP_NAME || 'nexLevel'}" <${adminEmail}>`,
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
              <p><strong>${inviterName}</strong> has invited you to join a challenge on nexLevel.</p>
              
              ${inviteMessage ? `<p style="background: #fff; padding: 15px; border-radius: 5px; font-style: italic; border-left: 3px solid #06b6d4;">"${inviteMessage}"</p>` : ''}
              
              <div class="challenge-box">
                <h3 style="color: #0891b2; margin-top: 0;">${challengeName}</h3>
                <p style="margin-bottom: 0;">${challengeDescription}</p>
              </div>
              
              <p>Join ${inviterName} and stay accountable together! Challenge each other, track progress, and achieve your goals as a team.</p>
              
              <center>
                <a href="${appUrl}/browse?join=${challengeId}" class="button">Join the Challenge</a>
              </center>
              
              <p style="margin-top: 30px; font-size: 14px; color: #666;">
                Already have an account? <a href="${appUrl}/login" style="color: #0891b2;">Log in</a> and browse challenges to join.
              </p>
            </div>
            <div class="footer">
              <p>This email was sent by nexLevel</p>
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
export async function sendNotificationEmail(recipientEmail, recipientName, notification) {
  try {
    // Use admin email for all notifications (no user Gmail config required)
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminEmailPassword = process.env.ADMIN_EMAIL_PASSWORD;

    if (!adminEmail || !adminEmailPassword) {
      console.log('⚠️ Admin email not configured - skipping notification email');
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
    
    // Map notification types to friendly titles, emojis, and colors
    const notificationStyles = {
      daily_motivation: { 
        title: '🌟 Daily Motivation', 
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        accentColor: '#f5576c'
      },
      friend_progress: { 
        title: '🎉 Friend Activity', 
        gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        accentColor: '#00f2fe'
      },
      streak_milestone: { 
        title: '🔥 Streak Milestone', 
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        accentColor: '#fa709a'
      },
      challenge_suggestion: { 
        title: '💡 New Challenge Suggestion', 
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        accentColor: '#667eea'
      },
      friend_suggestion: { 
        title: '👥 Friend Suggestion', 
        gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        accentColor: '#a8edea'
      },
      partner_checkin: { 
        title: '✅ Partner Check-in', 
        gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
        accentColor: '#0ba360'
      },
      partner_completed: { 
        title: '🎯 Your Partner Crushed It!', 
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        accentColor: '#f5576c'
      },
      challenge_reminder: { 
        title: '⏰ Challenge Reminder', 
        gradient: 'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
        accentColor: '#a6c1ee'
      },
      challenge_invitation: { 
        title: '🎯 Challenge Invitation', 
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        accentColor: '#667eea'
      },
      challenge_exit: { 
        title: '👋 Challenge Update', 
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        accentColor: '#667eea'
      }
    };
    
    const style = notificationStyles[notification.type] || {
      title: '🔔 Notification',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      accentColor: '#667eea'
    };
    
    // Motivational quotes based on notification type
    const motivationalQuotes = {
      partner_completed: [
        "Success breeds success. Let their achievement fuel your own! 💪",
        "They're crushing it - now it's your turn to shine! ⭐",
        "Momentum is contagious. Keep the energy going! 🚀",
        "Great teammates inspire greatness. Time to level up! 🏆"
      ],
      streak_milestone: [
        "Consistency is the secret to success. You're proving it! 🌟",
        "Every day you show up is a victory. Keep going! 💪",
        "Streaks don't lie - you're committed to excellence! 🔥"
      ],
      daily_motivation: [
        "Today is another opportunity to become 1% better! 📈",
        "Small steps daily lead to massive results! 🎯",
        "Your future self is cheering you on! 💪"
      ]
    };
    
    const quotes = motivationalQuotes[notification.type] || [];
    const randomQuote = quotes.length > 0 ? quotes[Math.floor(Math.random() * quotes.length)] : '';
    
    const subject = `${style.title} - ${notification.title}`;
    
    // Build motivational message for partner completion
    let motivationalContent = '';
    if (notification.type === 'partner_completed') {
      motivationalContent = `
        <div style="background: linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${style.accentColor};">
          <h3 style="color: ${style.accentColor}; margin-top: 0;">🎯 They Did It - Will You?</h3>
          <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
            <strong>${randomQuote}</strong>
          </p>
          <p style="color: #666; font-size: 14px;">
            Your accountability partner just took action. The best time to complete your tasks is RIGHT NOW! 
            Don't break the momentum - keep the streak alive together! 🔥
          </p>
        </div>
      `;
    } else if (notification.type === 'streak_milestone') {
      motivationalContent = `
        <div style="background: linear-gradient(135deg, #fff8e1 0%, #ffe0b2 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${style.accentColor};">
          <h3 style="color: ${style.accentColor}; margin-top: 0;">🔥 You're On Fire!</h3>
          <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
            <strong>${randomQuote}</strong>
          </p>
          <p style="color: #666; font-size: 14px;">
            Consistency compounds. Every day you show up, you're building the person you want to become. Don't stop now!
          </p>
        </div>
      `;
    } else if (notification.type === 'daily_motivation') {
      motivationalContent = `
        <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid ${style.accentColor};">
          <h3 style="color: ${style.accentColor}; margin-top: 0;">💪 Time to Take Action!</h3>
          <p style="font-size: 16px; color: #333; margin-bottom: 15px;">
            <strong>${randomQuote}</strong>
          </p>
          <p style="color: #666; font-size: 14px;">
            Don't wait for the perfect moment - create it! Check in on your challenges and keep building momentum.
          </p>
        </div>
      `;
    }
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'nexLevel'}" <${adminEmail}>`,
      to: recipientEmail,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: ${style.gradient}; color: white; padding: 30px 20px; text-align: center; border-radius: 0; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .content { padding: 30px 20px; background: white; }
            .notification-box { background: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid ${style.accentColor}; border-radius: 5px; }
            .notification-box h3 { margin-top: 0; color: ${style.accentColor}; }
            .button { display: inline-block; padding: 14px 32px; background: ${style.gradient}; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s; }
            .button:hover { transform: translateY(-2px); }
            .footer { text-align: center; padding: 20px; background: #f8f9fa; color: #666; font-size: 12px; border-top: 1px solid #e0e0e0; }
            .footer a { color: ${style.accentColor}; text-decoration: none; }
            .stats { display: flex; justify-content: space-around; margin: 20px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; }
            .stat-item { text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: ${style.accentColor}; }
            .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${style.title}</h1>
            </div>
            <div class="content">
              <h2 style="color: #333; margin-top: 0;">Hi ${recipientName}! 👋</h2>
              
              <div class="notification-box">
                <h3>${notification.title}</h3>
                <p style="font-size: 16px; margin: 0; color: #555;">${notification.message}</p>
              </div>
              
              ${motivationalContent}
              
              <center>
                <a href="${process.env.APP_URL || 'http://localhost:5173'}/dashboard" class="button">Take Action Now! 🚀</a>
              </center>
              
              <p style="text-align: center; color: #888; font-size: 14px; margin-top: 30px;">
                Stay consistent. Stay motivated. Stay nexLevel! 💪
              </p>
            </div>
            <div class="footer">
              <p style="margin: 5px 0;"><strong>nexLevel</strong> - Your accountability partner in success</p>
              <p style="margin: 5px 0;">
                <a href="${process.env.APP_URL || 'http://localhost:5173'}/settings">Notification Settings</a> • 
                <a href="${process.env.APP_URL || 'http://localhost:5173'}/dashboard">Dashboard</a>
              </p>
              <p style="margin: 15px 0 5px 0; color: #999; font-size: 11px;">
                You're receiving this because you enabled notifications in your nexLevel account.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transport.sendMail(mailOptions);
    console.log('✅ Notification email sent to:', recipientEmail);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending notification email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send challenge exit notification email
 */
export async function sendChallengeExitEmail(recipientEmail, recipientName, challengeName, partnerName, reason) {
  try {
    // Use admin email for all exit notifications
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminEmailPassword = process.env.ADMIN_EMAIL_PASSWORD;

    if (!adminEmail || !adminEmailPassword) {
      console.log('⚠️ Admin email not configured - skipping challenge exit email');
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
      from: `"${process.env.APP_NAME || 'nexLevel'}" <${adminEmail}>`,
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
              <p>This email was sent by nexLevel</p>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transport.sendMail(mailOptions);
    console.log('✅ Challenge exit email sent to:', recipientEmail);
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
      from: `"${process.env.APP_NAME || 'nexLevel'}" <${adminEmail}>`,
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
      from: `"${process.env.APP_NAME || 'nexLevel'}" <${recipientEmailConfig.gmailUser}>`,
      to: recipientEmail,
      subject: '✉️ Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to nexLevel! 🎉</h2>
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
      from: `"${process.env.APP_NAME || 'nexLevel'}" <${adminEmail}>`,
      to: recipientEmail,
      subject: '🔐 Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">Welcome to nexLevel! 🎉</h2>
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
      from: `"${process.env.APP_NAME || 'nexLevel'}" <${adminEmail}>`,
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

/**
 * Send feedback notification to admins
 */
export async function sendFeedbackNotificationToAdmins(feedbackData, db) {
  try {
    console.log('📧 Starting feedback notification process...');
    
    // System email for sending (from .env - logistics email)
    const systemEmail = process.env.ADMIN_EMAIL;
    const systemPassword = process.env.ADMIN_EMAIL_PASSWORD;

    console.log('📧 System email exists:', !!systemEmail);
    console.log('📧 System email value:', systemEmail ? `${systemEmail.substring(0, 3)}***` : 'NOT SET');
    console.log('📧 System password exists:', !!systemPassword);

    if (!systemEmail || !systemPassword) {
      console.error('❌ System email not configured');
      throw new Error('System email not configured');
    }

    // Get admin users from database
    const adminUsers = await db.collection('users').find({ role: 'admin' }).toArray();
    
    if (!adminUsers || adminUsers.length === 0) {
      console.error('❌ No admin users found in database');
      throw new Error('No admin users found');
    }

    const adminEmails = adminUsers.map(admin => admin.email).filter(email => email);
    console.log(`📧 Found ${adminEmails.length} admin(s):`, adminEmails.map(e => `${e.substring(0, 3)}***`).join(', '));

    console.log('📧 Creating email transporter...');
    const transport = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: systemEmail,
        pass: systemPassword
      }
    });

    // Verify transporter configuration
    console.log('📧 Verifying email transporter...');
    try {
      await transport.verify();
      console.log('✅ Email transporter verified successfully');
    } catch (verifyError) {
      console.error('❌ Email transporter verification failed:', verifyError.message);
      throw new Error(`Email configuration invalid: ${verifyError.message}`);
    }

    console.log('📧 Preparing email content...');
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'nexLevel'}" <${systemEmail}>`,
      to: systemEmail, // Send to system admin email
      subject: `📬 New Feedback Submission: ${feedbackData.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #06b6d4 0%, #14b8a6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #06b6d4; border-radius: 5px; }
            .label { font-weight: bold; color: #666; margin-bottom: 5px; }
            .value { color: #333; margin-bottom: 15px; }
            .message-box { background: #f0f9ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📬 New Feedback Received</h1>
            </div>
            <div class="content">
              <div class="info-box">
                <div class="label">From:</div>
                <div class="value">${feedbackData.name} (${feedbackData.email})</div>
                
                <div class="label">Subject:</div>
                <div class="value">${feedbackData.subject}</div>
                
                <div class="label">Message:</div>
                <div class="message-box">
                  ${feedbackData.message.replace(/\n/g, '<br>')}
                </div>
                
                <div class="label">Submitted:</div>
                <div class="value">${new Date(feedbackData.createdAt).toLocaleString()}</div>
              </div>
              
              <p style="color: #666; font-size: 14px;">
                You can manage this feedback in the admin dashboard.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    console.log('📧 Sending email from:', mailOptions.from);
    console.log('📧 Sending email to:', mailOptions.to);
    console.log('📧 Email subject:', mailOptions.subject);

    await transport.sendMail(mailOptions);
    console.log('✅ Feedback notification sent to:', systemEmail);
  } catch (error) {
    console.error('❌ Error sending feedback notification:', error);
    throw new Error('Failed to send feedback notification email');
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
  sendPasswordChangeEmail,
  sendFeedbackNotificationToAdmins
};
