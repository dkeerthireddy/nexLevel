import { ObjectId } from 'mongodb';
import { 
  hashPassword, 
  comparePassword, 
  generateToken,
  validateEmail,
  validatePassword,
  encryptSensitiveData
} from '../../lib/auth.js';
import {
  createPasswordResetToken,
  verifyPasswordResetToken,
  markTokenUsed,
  verifyEmailToken,
  sendVerificationEmail
} from '../../lib/password-reset.js';
import {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  verifyBackupCode,
  enableTwoFactorForUser,
  disableTwoFactorForUser
} from '../../lib/two-factor.js';
import { sendFeedbackNotificationToAdmins } from '../../lib/email.js';
import { uploadToCloudinary } from '../../lib/cloudinary.js';
import { 
  verifyPhotoWithAI,
  generateMotivationalMessage,
  generateWeeklyReport,
  generateChallengeRecommendations
} from '../../lib/gemini.js';
import { 
  sendChallengeInvitationEmail,
  sendNotificationEmail,
  sendChallengeExitEmail
} from '../../lib/email.js';
import { 
  sendFriendProgressNotification,
  sendStreakMilestoneNotification
} from '../../lib/notifications.js';
import { 
  sendTaskCompletionNotificationToFriends
} from '../../lib/task-notifications.js';

/**
 * Mutation Resolvers for GraphQL API
 */
export const Mutation = {
  // ============================================================
  // AUTHENTICATION
  // ============================================================
  
  signup: async (_, { email, password, displayName }, { db }) => {
    try {
      // Validate inputs
      if (!email || !password || !displayName) {
        throw new Error('Email, password, and display name are required');
      }

      // Trim and validate email
      email = email.trim().toLowerCase();
      if (!validateEmail(email)) {
        throw new Error('Invalid email format. Please enter a valid email address.');
      }

      // Validate display name
      displayName = displayName.trim();
      if (displayName.length < 2) {
        throw new Error('Display name must be at least 2 characters long');
      }
      if (displayName.length > 50) {
        throw new Error('Display name must be less than 50 characters');
      }

      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

      // Check if user already exists (case-insensitive)
      const existingUser = await db.collection('users').findOne({ 
        email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      if (existingUser) {
        throw new Error('An account with this email already exists. Please login or use a different email.');
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Generate 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Create user document with email config initialized
      const newUser = {
        email,
        passwordHash,
        displayName,
        profilePhoto: null,
        emailVerified: false,
        verificationCode,
        verificationCodeExpires: codeExpires,
        twoFactorEnabled: false,
        role: 'user', // Default role is 'user', admin can be set in database manually
        emailConfig: {
          gmailUser: null,
          gmailAppPassword: null,
          enabled: false
        },
        settings: {
          notifications: {
            enabled: true,
            quietHours: {
              start: '22:00',
              end: '07:00'
            },
            types: {
              partnerComplete: true,
              dailyReminder: true,
              streakMilestone: true
            }
          },
          ai: {
            coachEnabled: true,
            photoVerification: true,
            recommendations: true,
            weeklyReports: true
          },
          theme: 'light'
        },
        friendIds: [],
        friendRequests: {
          sent: [],
          received: []
        },
        stats: {
          totalChallenges: 0,
          activeChallenges: 0,
          completedChallenges: 0,
          totalCheckIns: 0,
          longestStreak: 0
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      };

      // Insert user
      let result;
      try {
        result = await db.collection('users').insertOne(newUser);
      } catch (insertError) {
        // Handle MongoDB duplicate key error (E11000)
        if (insertError.code === 11000 || insertError.message.includes('E11000')) {
          throw new Error('An account with this email already exists. Please login or use a different email.');
        }
        throw insertError;
      }
      const user = { ...newUser, _id: result.insertedId };

      // Send verification code email using admin email settings (from env)
      try {
        const { sendSignupVerificationEmail } = await import('../../lib/email.js');
        await sendSignupVerificationEmail(email, displayName, verificationCode);
        console.log('✅ Verification code sent to:', email);
      } catch (error) {
        console.error('Failed to send verification email:', error.message);
        // Continue anyway - user can resend
      }

      // Generate JWT token (but user needs to verify email to fully activate)
      const token = generateToken(user._id);

      console.log('✅ New user signed up (pending verification):', email);

      // Transform _id to id for GraphQL compatibility
      return { 
        token, 
        user: {
          ...user,
          id: user._id.toString(),
          _id: user._id
        }
      };
    } catch (error) {
      console.error('Signup error:', error.message);
      throw error;
    }
  },

  login: async (_, { email, password, twoFactorCode }, { db }) => {
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }

      // Trim and normalize email
      email = email.trim().toLowerCase();

      // Find user by email (case-insensitive)
      const user = await db.collection('users').findOne({ 
        email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
      });
      if (!user) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }

      // Compare password
      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      }

      // Check 2FA if enabled
      if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
          throw new Error('Two-factor authentication code required');
        }

        // Try to verify 2FA token
        const tokenValid = verifyTwoFactorToken(user.twoFactorSecret, twoFactorCode);
        
        // If token invalid, try backup code
        if (!tokenValid) {
          const backupValid = await verifyBackupCode(db, user._id, twoFactorCode);
          if (!backupValid) {
            throw new Error('Invalid two-factor authentication code');
          }
        }
      }

      // Initialize emailConfig if not present (for existing users)
      if (!user.emailConfig) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { 
            $set: { 
              emailConfig: {
                gmailUser: null,
                gmailAppPassword: null,
                enabled: false
              }
            }
          }
        );
        user.emailConfig = {
          gmailUser: null,
          gmailAppPassword: null,
          enabled: false
        };
      }

      // Update last login
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { lastLoginAt: new Date() } }
      );

      // Generate JWT token
      const token = generateToken(user._id);

      console.log('✅ User logged in:', email);

      // Transform _id to id for GraphQL compatibility
      return { 
        token, 
        user: {
          ...user,
          id: user._id.toString(),
          _id: user._id
        }
      };
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // PASSWORD RESET & EMAIL VERIFICATION
  // ============================================================

  requestPasswordReset: async (_, { email }, { db }) => {
    try {
      email = email.toLowerCase().trim();
      await createPasswordResetToken(db, email);
      return true;
    } catch (error) {
      console.error('Password reset request error:', error.message);
      // Always return true for security (don't reveal if email exists)
      return true;
    }
  },

  resetPassword: async (_, { token, newPassword }, { db }) => {
    try {
      // Validate new password
      validatePassword(newPassword);

      // Verify token
      const reset = await verifyPasswordResetToken(db, token);

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update user password
      await db.collection('users').updateOne(
        { _id: reset.userId },
        { $set: { passwordHash: hashedPassword, updatedAt: new Date() } }
      );

      // Mark token as used
      await markTokenUsed(db, token);

      console.log('✅ Password reset successful for user:', reset.userId);
      return true;
    } catch (error) {
      console.error('Password reset error:', error.message);
      throw error;
    }
  },

  verifyEmail: async (_, { code }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    try {
      const userDoc = await db.collection('users').findOne({ _id: user._id });
      
      if (!userDoc) {
        throw new Error('User not found');
      }

      if (userDoc.emailVerified) {
        return true; // Already verified
      }

      if (!userDoc.verificationCode || !userDoc.verificationCodeExpires) {
        throw new Error('No verification code found. Please request a new one.');
      }

      if (new Date() > userDoc.verificationCodeExpires) {
        throw new Error('Verification code expired. Please request a new one.');
      }

      if (userDoc.verificationCode !== code.trim()) {
        throw new Error('Invalid verification code. Please check and try again.');
      }

      // Mark email as verified
      await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $set: { emailVerified: true },
          $unset: { verificationCode: '', verificationCodeExpires: '' }
        }
      );

      console.log('✅ Email verified successfully:', userDoc.email);
      return true;
    } catch (error) {
      console.error('Email verification error:', error.message);
      throw error;
    }
  },

  resendVerificationEmail: async (_, __, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    try {
      const userDoc = await db.collection('users').findOne({ _id: user._id });
      
      if (!userDoc) {
        throw new Error('User not found');
      }

      if (userDoc.emailVerified) {
        throw new Error('Email already verified');
      }

      // Generate new 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Update user with new code
      await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $set: { 
            verificationCode,
            verificationCodeExpires: codeExpires
          }
        }
      );

      // Send verification code email using admin email settings
      const { sendSignupVerificationEmail } = await import('../../lib/email.js');
      await sendSignupVerificationEmail(userDoc.email, userDoc.displayName, verificationCode);
      
      console.log('✅ Verification code resent to:', userDoc.email);
      return true;
    } catch (error) {
      console.error('Resend verification error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // PASSWORD CHANGE (with email verification)
  // ============================================================

  requestPasswordChange: async (_, { currentPassword }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    try {
      const userDoc = await db.collection('users').findOne({ _id: user._id });
      
      if (!userDoc) {
        throw new Error('User not found');
      }

      // Verify current password
      const isValid = await comparePassword(currentPassword, userDoc.passwordHash);
      if (!isValid) {
        throw new Error('Current password is incorrect');
      }

      // Generate 6-digit verification code
      const passwordChangeCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Store the code in the database
      await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $set: { 
            passwordChangeCode,
            passwordChangeCodeExpires: codeExpires
          }
        }
      );

      // Send verification code email using admin email settings
      const { sendPasswordChangeEmail } = await import('../../lib/email.js');
      await sendPasswordChangeEmail(userDoc.email, userDoc.displayName, passwordChangeCode);
      
      console.log('✅ Password change code sent to:', userDoc.email);
      return true;
    } catch (error) {
      console.error('Request password change error:', error.message);
      throw error;
    }
  },

  changePassword: async (_, { code, newPassword }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    try {
      const userDoc = await db.collection('users').findOne({ _id: user._id });
      
      if (!userDoc) {
        throw new Error('User not found');
      }

      // Check if code exists
      if (!userDoc.passwordChangeCode || !userDoc.passwordChangeCodeExpires) {
        throw new Error('No password change request found. Please request a new code.');
      }

      // Check if code is expired
      if (new Date() > userDoc.passwordChangeCodeExpires) {
        throw new Error('Verification code expired. Please request a new one.');
      }

      // Verify the code
      if (userDoc.passwordChangeCode !== code.trim()) {
        throw new Error('Invalid verification code. Please check and try again.');
      }

      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        throw new Error(passwordValidation.message);
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update password and remove verification code
      await db.collection('users').updateOne(
        { _id: user._id },
        { 
          $set: { 
            passwordHash: newPasswordHash,
            updatedAt: new Date()
          },
          $unset: { 
            passwordChangeCode: '',
            passwordChangeCodeExpires: ''
          }
        }
      );

      console.log('✅ Password changed successfully for user:', userDoc.email);
      return true;
    } catch (error) {
      console.error('Change password error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // TWO-FACTOR AUTHENTICATION
  // ============================================================

  enableTwoFactor: async (_, __, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    try {
      if (user.twoFactorEnabled) {
        throw new Error('Two-factor authentication is already enabled');
      }

      const { secret, qrCode, backupCodes } = await generateTwoFactorSecret(user.email);

      // Store secret temporarily (not enabled yet, waiting for verification)
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { twoFactorSecretPending: secret, twoFactorBackupCodesPending: backupCodes } }
      );

      return { secret, qrCode, backupCodes };
    } catch (error) {
      console.error('Enable 2FA error:', error.message);
      throw error;
    }
  },

  verifyTwoFactor: async (_, { code }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    try {
      const userDoc = await db.collection('users').findOne({ _id: user._id });
      
      if (!userDoc.twoFactorSecretPending) {
        throw new Error('No pending two-factor setup found');
      }

      const isValid = verifyTwoFactorToken(userDoc.twoFactorSecretPending, code);
      
      if (!isValid) {
        throw new Error('Invalid verification code');
      }

      // Enable 2FA
      await enableTwoFactorForUser(db, user._id, userDoc.twoFactorSecretPending, userDoc.twoFactorBackupCodesPending);

      // Remove pending data
      await db.collection('users').updateOne(
        { _id: user._id },
        { $unset: { twoFactorSecretPending: '', twoFactorBackupCodesPending: '' } }
      );

      console.log('✅ Two-factor authentication enabled for user:', user._id);
      return true;
    } catch (error) {
      console.error('Verify 2FA error:', error.message);
      throw error;
    }
  },

  disableTwoFactor: async (_, { code }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    try {
      if (!user.twoFactorEnabled) {
        throw new Error('Two-factor authentication is not enabled');
      }

      const userDoc = await db.collection('users').findOne({ _id: user._id });

      // Verify code before disabling
      const tokenValid = verifyTwoFactorToken(userDoc.twoFactorSecret, code);
      const backupValid = !tokenValid && await verifyBackupCode(db, user._id, code);

      if (!tokenValid && !backupValid) {
        throw new Error('Invalid verification code');
      }

      await disableTwoFactorForUser(db, user._id);

      console.log('✅ Two-factor authentication disabled for user:', user._id);
      return true;
    } catch (error) {
      console.error('Disable 2FA error:', error.message);
      throw error;
    }
  },

  // ============================================================
  // PROFILE
  // ============================================================
  
  updateProfile: async (_, { displayName, profilePhoto }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const updates = {};
    if (displayName) updates.displayName = displayName;
    if (profilePhoto !== undefined) updates.profilePhoto = profilePhoto;
    updates.updatedAt = new Date();

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: updates }
    );

    return await db.collection('users').findOne({ _id: user._id });
  },

  updateSettings: async (_, { settings }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const updates = {
      updatedAt: new Date()
    };

    if (settings.notifications) {
      updates['settings.notifications'] = {
        ...user.settings.notifications,
        ...settings.notifications
      };
    }

    if (settings.ai) {
      updates['settings.ai'] = {
        ...user.settings.ai,
        ...settings.ai
      };
    }

    if (settings.theme) {
      // Validate theme value
      if (!['light', 'dark'].includes(settings.theme)) {
        throw new Error('Invalid theme. Must be "light" or "dark"');
      }
      updates['settings.theme'] = settings.theme;
    }

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: updates }
    );

    return await db.collection('users').findOne({ _id: user._id });
  },

  updateEmailConfig: async (_, { gmailUser, gmailAppPassword, enabled }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Validate email format if provided
    if (gmailUser && !validateEmail(gmailUser)) {
      throw new Error('Invalid Gmail address format');
    }

    // Validate Gmail app password format (should be 16 characters)
    if (gmailAppPassword) {
      const cleanPassword = gmailAppPassword.replace(/\s/g, ''); // Remove spaces
      if (cleanPassword.length !== 16) {
        throw new Error('Gmail App Password must be 16 characters');
      }
    }

    const updates = {
      updatedAt: new Date()
    };

    // Only update fields that are provided
    if (gmailUser !== undefined) {
      updates['emailConfig.gmailUser'] = gmailUser;
    }
    
    if (gmailAppPassword !== undefined) {
      // Encrypt the password before storing using user-specific key
      try {
        const encryptedPassword = encryptSensitiveData(gmailAppPassword, user._id);
        updates['emailConfig.gmailAppPassword'] = encryptedPassword;
      } catch (error) {
        console.error('Failed to encrypt email password:', error);
        throw new Error('Failed to save email configuration. Please try again.');
      }
    }
    
    if (enabled !== undefined) {
      updates['emailConfig.enabled'] = enabled;
    }

    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: updates }
    );

    console.log('✅ Email configuration updated for user:', user.email);

    return await db.collection('users').findOne({ _id: user._id });
  },

  // ============================================================
  // CHALLENGES
  // ============================================================
  
  createChallenge: async (_, { input }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Process tasks if provided
    const tasks = (input.tasks || []).map((task, index) => ({
      id: new ObjectId().toString(),
      title: task.title,
      description: task.description || null,
      order: task.order !== undefined ? task.order : index
    }));

    const challenge = {
      name: input.name,
      description: input.description,
      category: input.category,
      frequency: input.frequency,
      duration: input.duration,
      requirePhotoProof: input.requirePhotoProof || false,
      allowGraceSkips: input.allowGraceSkips !== false,
      graceSkipsPerWeek: input.graceSkipsPerWeek || 1,
      createdBy: user._id,
      isTemplate: false,
      isPublic: input.isPublic !== false,
      challengeType: input.challengeType || 'solo', // Default to solo
      tasks, // Add tasks to challenge
      collaborators: [], // Initialize empty collaborators array
      stats: {
        totalUsers: 0,
        activeUsers: 0,
        completionRate: 0,
        avgSuccessRate: 0
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('challenges').insertOne(challenge);
    
    console.log('✅ Challenge created:', challenge.name, `(${challenge.challengeType}) with ${tasks.length} tasks`);

    return { ...challenge, _id: result.insertedId };
  },

  updateChallenge: async (_, { id, input }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const challenge = await db.collection('challenges').findOne({ _id: new ObjectId(id) });
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (!challenge.createdBy.equals(user._id)) {
      throw new Error('Not authorized to update this challenge');
    }

    const updates = { ...input, updatedAt: new Date() };

    await db.collection('challenges').updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    return await db.collection('challenges').findOne({ _id: new ObjectId(id) });
  },

  deleteChallenge: async (_, { id }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const challenge = await db.collection('challenges').findOne({ _id: new ObjectId(id) });
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (!challenge.createdBy.equals(user._id)) {
      throw new Error('Not authorized to delete this challenge');
    }

    await db.collection('challenges').deleteOne({ _id: new ObjectId(id) });
    
    console.log('✅ Challenge deleted:', id);

    return true;
  },

  // ============================================================
  // USER CHALLENGES
  // ============================================================
  
  joinChallenge: async (_, { challengeId, partnerIds = [] }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const challenge = await db.collection('challenges').findOne({ _id: new ObjectId(challengeId) });
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Check if user already has an active instance of this challenge
    const existingActiveChallenge = await db.collection('userChallenges').findOne({
      userId: user._id,
      challengeId: new ObjectId(challengeId),
      status: 'active'
    });

    if (existingActiveChallenge) {
      throw new Error('You already have an active instance of this challenge. Complete or exit the current one before joining again.');
    }
    
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + challenge.duration);

    const userChallenge = {
      userId: user._id,
      challengeId: new ObjectId(challengeId),
      partnerIds: partnerIds.map(id => new ObjectId(id)),
      invitedBy: null,
      currentStreak: 0,
      longestStreak: 0,
      totalCheckIns: 0,
      missedDays: 0,
      graceSkipsUsed: 0,
      completionRate: 0,
      status: 'active',
      startDate,
      endDate,
      lastCheckInAt: null,
      notificationTime: '07:00',
      reminderEnabled: true,
      joinedAt: new Date(),
      completedAt: null
    };

    const result = await db.collection('userChallenges').insertOne(userChallenge);

    // Update user stats
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $inc: { 
          'stats.totalChallenges': 1,
          'stats.activeChallenges': 1
        }
      }
    );

    // Update challenge stats
    await db.collection('challenges').updateOne(
      { _id: new ObjectId(challengeId) },
      { 
        $inc: { 
          'stats.totalUsers': 1,
          'stats.activeUsers': 1
        }
      }
    );

    console.log('✅ User joined challenge:', challenge.name);

    return { ...userChallenge, _id: result.insertedId };
  },

  leaveChallenge: async (_, { userChallengeId }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const userChallenge = await db.collection('userChallenges').findOne({ 
      _id: new ObjectId(userChallengeId) 
    });

    if (!userChallenge) {
      throw new Error('User challenge not found');
    }

    if (!userChallenge.userId.equals(user._id)) {
      throw new Error('Not authorized');
    }

    // Update status instead of deleting
    await db.collection('userChallenges').updateOne(
      { _id: new ObjectId(userChallengeId) },
      { $set: { status: 'abandoned', completedAt: new Date() } }
    );

    // Update user stats
    await db.collection('users').updateOne(
      { _id: user._id },
      { $inc: { 'stats.activeChallenges': -1 } }
    );

    // Update challenge stats
    await db.collection('challenges').updateOne(
      { _id: userChallenge.challengeId },
      { $inc: { 'stats.activeUsers': -1 } }
    );

    console.log('✅ User left challenge:', userChallengeId);

    return true;
  },

  // ============================================================
  // TASK PROGRESS MANAGEMENT
  // ============================================================
  
  updateTaskProgress: async (_, { userChallengeId, taskId, completed }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const userChallenge = await db.collection('userChallenges').findOne({ 
      _id: new ObjectId(userChallengeId) 
    });

    if (!userChallenge) {
      throw new Error('User challenge not found');
    }

    if (!userChallenge.userId.equals(user._id)) {
      throw new Error('Not authorized');
    }

    // Get the challenge to validate the task
    const challenge = await db.collection('challenges').findOne({ 
      _id: userChallenge.challengeId 
    });

    if (!challenge || !challenge.tasks) {
      throw new Error('Challenge not found');
    }

    // Validate that the task exists in this challenge
    const task = challenge.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found in this challenge');
    }

    // Get all check-ins for this task
    const checkIns = await db.collection('checkIns')
      .find({ 
        userChallengeId: new ObjectId(userChallengeId),
        taskId: taskId 
      })
      .toArray();

    const lastCheckIn = checkIns.length > 0 
      ? checkIns.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
      : null;

    console.log('✅ Task progress updated:', task.title);

    return {
      taskId: taskId,
      task: task,
      completed: checkIns.length > 0,
      completedAt: lastCheckIn ? lastCheckIn.timestamp : null,
      completedCount: checkIns.length
    };
  },

  // ============================================================
  // CHECK-INS (PER TASK)
  // ============================================================
  
  checkIn: async (_, { userChallengeId, taskId, note, photoBase64 }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const userChallenge = await db.collection('userChallenges').findOne({ 
      _id: new ObjectId(userChallengeId) 
    });

    if (!userChallenge) {
      throw new Error('User challenge not found');
    }

    if (!userChallenge.userId.equals(user._id)) {
      throw new Error('Not authorized');
    }

    // Get the challenge to validate the task
    const challenge = await db.collection('challenges').findOne({ 
      _id: userChallenge.challengeId 
    });

    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Validate that the task exists in this challenge
    const task = challenge.tasks?.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found in this challenge');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today for this specific task
    const existingCheckIn = await db.collection('checkIns').findOne({
      userChallengeId: new ObjectId(userChallengeId),
      taskId: taskId,
      date: today
    });

    if (existingCheckIn) {
      throw new Error('Already checked in today for this task');
    }

    let photoUrl = null;
    let aiVerification = null;

    // Photo upload is currently disabled
    if (photoBase64) {
      console.log('⚠️  Photo upload is currently disabled. Check-in will be saved without photo.');
      // Optionally, you can uncomment the following to enable photo uploads:
      /*
      try {
        const cloudinaryResult = await uploadToCloudinary(photoBase64);
        photoUrl = cloudinaryResult.url;

        // AI verification if enabled
        if (user.settings?.ai?.photoVerification) {
          aiVerification = await verifyPhotoWithAI(photoBase64);
          aiVerification.model = 'gemini-2.0-flash';
        }
      } catch (error) {
        console.error('Photo upload/verification failed:', error.message);
        // Continue without photo
      }
      */
    }

    // Create check-in
    const checkIn = {
      userChallengeId: new ObjectId(userChallengeId),
      userId: user._id,
      challengeId: userChallenge.challengeId,
      taskId: taskId,
      date: today,
      timestamp: new Date(),
      note: note || null,
      photoUrl,
      aiVerification,
      isEdited: false,
      createdAt: new Date()
    };

    const result = await db.collection('checkIns').insertOne(checkIn);

    // Update streak and stats
    const newStreak = userChallenge.currentStreak + 1;
    const newLongestStreak = Math.max(newStreak, userChallenge.longestStreak);
    const newTotalCheckIns = userChallenge.totalCheckIns + 1;
    
    const daysElapsed = Math.ceil((new Date() - userChallenge.startDate) / (1000 * 60 * 60 * 24));
    const completionRate = daysElapsed > 0 ? (newTotalCheckIns / daysElapsed) * 100 : 0;

    await db.collection('userChallenges').updateOne(
      { _id: new ObjectId(userChallengeId) },
      { 
        $set: {
          currentStreak: newStreak,
          longestStreak: newLongestStreak,
          totalCheckIns: newTotalCheckIns,
          completionRate: Math.min(completionRate, 100),
          lastCheckInAt: new Date()
        }
      }
    );

    // Update user stats
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $inc: { 'stats.totalCheckIns': 1 },
        $max: { 'stats.longestStreak': newLongestStreak }
      }
    );

    // Check for streak milestone and send notification
    const milestones = [7, 14, 21, 30, 50, 75, 100, 200, 365];
    if (milestones.includes(newStreak)) {
      await sendStreakMilestoneNotification(db, user._id, new ObjectId(userChallengeId), newStreak);
    }

    // Notify partners about task completion
    if (userChallenge.partnerIds && userChallenge.partnerIds.length > 0) {
      const notifications = userChallenge.partnerIds.map(partnerId => ({
        userId: partnerId,
        type: 'partner_completed',
        title: `${user.displayName} completed a task! 🎉`,
        message: `Your partner just completed "${task.title}" in ${challenge.name}`,
        challengeId: userChallenge.challengeId,
        partnerId: user._id,
        taskId: taskId,
        read: false,
        createdAt: new Date()
      }));

      if (notifications.length > 0) {
        await db.collection('notifications').insertMany(notifications);
      }

      // Send email notifications to all friends/partners about task completion
      try {
        await sendTaskCompletionNotificationToFriends(
          db, 
          user._id, 
          new ObjectId(userChallengeId), 
          taskId, 
          task.title, 
          challenge.name
        );
      } catch (error) {
        console.error('Failed to send task completion emails to friends:', error.message);
      }
    }

    console.log('✅ Task check-in created for user:', user.email, 'Task:', task.title);

    return { ...checkIn, _id: result.insertedId };
  },

  updateCheckIn: async (_, { id, note }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const checkIn = await db.collection('checkIns').findOne({ _id: new ObjectId(id) });
    if (!checkIn) {
      throw new Error('Check-in not found');
    }

    if (!checkIn.userId.equals(user._id)) {
      throw new Error('Not authorized');
    }

    // Check if within 24 hours
    const hoursSinceCheckIn = (new Date() - checkIn.timestamp) / (1000 * 60 * 60);
    if (hoursSinceCheckIn > 24) {
      throw new Error('Cannot edit check-in after 24 hours');
    }

    await db.collection('checkIns').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          note,
          isEdited: true,
          editedAt: new Date()
        }
      }
    );

    return await db.collection('checkIns').findOne({ _id: new ObjectId(id) });
  },

  // ============================================================
  // AI FEATURES
  // ============================================================
  
  generateAICoachMessage: async (_, { challengeId }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check global system setting first
    const systemSettings = await db.collection('systemSettings').findOne({ key: 'global' });
    if (systemSettings && systemSettings.aiCoachEnabled === false) {
      throw new Error('AI Coach is currently disabled by system administrators');
    }

    if (!user.settings?.ai?.coachEnabled) {
      throw new Error('AI coach is disabled in settings');
    }

    // Get user's recent progress
    const userChallenges = await db.collection('userChallenges')
      .find({ 
        userId: user._id,
        status: 'active'
      })
      .toArray();

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const checkIns = await db.collection('checkIns')
      .find({
        userId: user._id,
        date: { $gte: weekAgo }
      })
      .toArray();

    const userData = {
      activeChallenges: userChallenges.length,
      checkInsThisWeek: checkIns.length,
      streaks: userChallenges.map(uc => uc.currentStreak)
    };

    const content = await generateMotivationalMessage(userData);

    // Save message to DB
    const message = {
      userId: user._id,
      type: 'motivation',
      content: content.trim(),
      challengeId: challengeId ? new ObjectId(challengeId) : null,
      triggeredBy: 'manual',
      generated: true,
      model: 'gemini-2.0-flash',
      cached: false,
      read: false,
      liked: null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    const result = await db.collection('aiMessages').insertOne(message);

    console.log('✅ AI coach message generated');

    return { ...message, _id: result.insertedId };
  },

  generateWeeklyReport: async (_, __, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check global system setting first
    const systemSettings = await db.collection('systemSettings').findOne({ key: 'global' });
    if (systemSettings && systemSettings.aiCoachEnabled === false) {
      throw new Error('AI Coach is currently disabled by system administrators');
    }

    if (!user.settings?.ai?.weeklyReports) {
      throw new Error('Weekly reports are disabled in settings');
    }

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const userChallenges = await db.collection('userChallenges')
      .find({ userId: user._id })
      .toArray();

    const checkIns = await db.collection('checkIns')
      .find({
        userId: user._id,
        date: { $gte: weekAgo }
      })
      .toArray();

    // Calculate stats per challenge
    const challengeStats = await Promise.all(userChallenges.map(async uc => {
      const challenge = await db.collection('challenges').findOne({ _id: uc.challengeId });
      const challengeCheckIns = checkIns.filter(
        ci => ci.userChallengeId.equals(uc._id)
      );

      return {
        name: challenge?.name || 'Challenge',
        checkIns: challengeCheckIns.length,
        expected: 7,
        rate: ((challengeCheckIns.length / 7) * 100).toFixed(0),
        streak: uc.currentStreak
      };
    }));

    const content = await generateWeeklyReport(challengeStats);

    const message = {
      userId: user._id,
      type: 'insight',
      content: content.trim(),
      challengeId: null,
      triggeredBy: 'weekly_analysis',
      generated: true,
      model: 'gemini-2.0-flash',
      cached: false,
      read: false,
      liked: null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    const result = await db.collection('aiMessages').insertOne(message);

    console.log('✅ Weekly report generated');

    return { ...message, _id: result.insertedId };
  },

  markAIMessageRead: async (_, { id }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    await db.collection('aiMessages').updateOne(
      { _id: new ObjectId(id), userId: user._id },
      { $set: { read: true, readAt: new Date() } }
    );

    return await db.collection('aiMessages').findOne({ _id: new ObjectId(id) });
  },

  likeMessage: async (_, { id, liked }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    await db.collection('aiMessages').updateOne(
      { _id: new ObjectId(id), userId: user._id },
      { $set: { liked } }
    );

    return await db.collection('aiMessages').findOne({ _id: new ObjectId(id) });
  },

  // ============================================================
  // SOCIAL
  // ============================================================
  
  sendFriendRequest: async (_, { userId }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const targetUserId = new ObjectId(userId);
    
    // Check if already friends
    const currentUser = await db.collection('users').findOne({ _id: user._id });
    if (currentUser.friendIds && currentUser.friendIds.some(id => id.equals(targetUserId))) {
      throw new Error('Already friends with this user');
    }
    
    // Check if request already sent
    if (currentUser.friendRequests?.sent && currentUser.friendRequests.sent.some(id => id.equals(targetUserId))) {
      throw new Error('Friend request already sent');
    }

    // Add to sent requests
    await db.collection('users').updateOne(
      { _id: user._id },
      { $addToSet: { 'friendRequests.sent': targetUserId } }
    );

    // Add to received requests
    await db.collection('users').updateOne(
      { _id: targetUserId },
      { $addToSet: { 'friendRequests.received': user._id } }
    );

    console.log('✅ Friend request sent');

    return true;
  },

  acceptFriendRequest: async (_, { userId }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const friendId = new ObjectId(userId);

    // Add to both users' friend lists
    await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $addToSet: { friendIds: friendId },
        $pull: { 'friendRequests.received': friendId }
      }
    );

    await db.collection('users').updateOne(
      { _id: friendId },
      { 
        $addToSet: { friendIds: user._id },
        $pull: { 'friendRequests.sent': user._id }
      }
    );

    console.log('✅ Friend request accepted');

    return true;
  },

  removeFriend: async (_, { userId }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const friendId = new ObjectId(userId);

    // Remove from both users' friend lists
    await db.collection('users').updateOne(
      { _id: user._id },
      { $pull: { friendIds: friendId } }
    );

    await db.collection('users').updateOne(
      { _id: friendId },
      { $pull: { friendIds: user._id } }
    );

    console.log('✅ Friend removed');

    return true;
  },

  inviteFriendToChallenge: async (_, { friendId, challengeId }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const challenge = await db.collection('challenges').findOne({ _id: new ObjectId(challengeId) });
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    const friend = await db.collection('users').findOne({ _id: new ObjectId(friendId) });
    if (!friend) {
      throw new Error('Friend not found');
    }

    // Create notification for friend
    const notification = {
      userId: friend._id,
      type: 'challenge_invitation',
      title: `${user.displayName} invited you to join a challenge!`,
      message: `Join "${challenge.name}" and stay accountable together.`,
      challengeId: challenge._id,
      inviterId: user._id,
      read: false,
      createdAt: new Date()
    };

    await db.collection('notifications').insertOne(notification);

    // Send email notification if user has email notifications enabled
    if (friend.settings?.notifications?.enabled && friend?.emailConfig?.enabled) {
      try {
        await sendNotificationEmail(friend.email, friend.displayName, notification, friend.emailConfig, friend._id);
      } catch (error) {
        console.error('Failed to send email notification:', error.message);
      }
    }

    console.log('✅ Friend invited to challenge:', friend.displayName);

    return true;
  },

  // NEW: Invite to specific user challenge instance
  inviteEmailToUserChallenge: async (_, { email, userChallengeId, message }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get the user challenge instance
    const userChallenge = await db.collection('userChallenges').findOne({ 
      _id: new ObjectId(userChallengeId),
      userId: user._id 
    });

    if (!userChallenge) {
      throw new Error('Challenge instance not found or you do not have access');
    }

    // Get the base challenge
    const challenge = await db.collection('challenges').findOne({ _id: userChallenge.challengeId });
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Send invitation email using admin email settings
    try {
      const { sendUserChallengeInvitationEmailAdmin } = await import('../../lib/email.js');
      await sendUserChallengeInvitationEmailAdmin(
        email,
        user.displayName,
        challenge.name,
        challenge.description,
        userChallengeId,
        message || ''
      );

      console.log(`✅ User challenge invitation sent to ${email} for instance ${userChallengeId}`);
      return true;
    } catch (error) {
      console.error('Error sending user challenge invitation email:', error);
      throw new Error('Failed to send invitation email');
    }
  },

  // OLD: Invite to base challenge (keep for backward compatibility)
  inviteEmailToChallenge: async (_, { email, challengeId, message }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Validate email
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    const challenge = await db.collection('challenges').findOne({ _id: new ObjectId(challengeId) });
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Send invitation email using admin email settings (so it works for all users)
    try {
      const { sendChallengeInvitationEmailAdmin } = await import('../../lib/email.js');
      await sendChallengeInvitationEmailAdmin(
        email,
        user.displayName,
        challenge.name,
        challenge.description,
        challengeId,
        message || ''
      );

      // Log the invitation
      await db.collection('challengeInvitations').insertOne({
        challengeId: challenge._id,
        inviterId: user._id,
        inviteeEmail: email,
        message: message || null,
        status: 'sent',
        sentAt: new Date()
      });

      console.log('✅ Email invitation sent to:', email);

      return true;
    } catch (error) {
      console.error('Failed to send email invitation:', error);
      throw new Error('Failed to send invitation email. Please make sure admin email is configured.');
    }
  },

  shareProgressWithFriend: async (_, { friendId, userChallengeId }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const userChallenge = await db.collection('userChallenges').findOne({ 
      _id: new ObjectId(userChallengeId) 
    });

    if (!userChallenge || !userChallenge.userId.equals(user._id)) {
      throw new Error('User challenge not found');
    }

    const challenge = await db.collection('challenges').findOne({ _id: userChallenge.challengeId });
    const friend = await db.collection('users').findOne({ _id: new ObjectId(friendId) });

    if (!friend) {
      throw new Error('Friend not found');
    }

    // Create notification
    const notification = {
      userId: friend._id,
      type: 'friend_progress',
      title: `${user.displayName} shared their progress!`,
      message: `Check out their progress in "${challenge.name}": ${userChallenge.currentStreak} day streak, ${userChallenge.completionRate.toFixed(0)}% completion rate.`,
      challengeId: challenge._id,
      sharedBy: user._id,
      read: false,
      createdAt: new Date()
    };

    await db.collection('notifications').insertOne(notification);

    // Send email notification
    if (friend.settings?.notifications?.enabled && friend?.emailConfig?.enabled) {
      try {
        await sendNotificationEmail(friend.email, friend.displayName, notification, friend.emailConfig, friend._id);
      } catch (error) {
        console.error('Failed to send email notification:', error.message);
      }
    }

    console.log('✅ Progress shared with friend:', friend.displayName);

    return true;
  },

  renameChallenge: async (_, { challengeId, newName }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const challenge = await db.collection('challenges').findOne({ _id: new ObjectId(challengeId) });
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    if (!challenge.createdBy.equals(user._id)) {
      throw new Error('Not authorized to rename this challenge');
    }

    if (!newName || newName.trim().length === 0) {
      throw new Error('Challenge name cannot be empty');
    }

    await db.collection('challenges').updateOne(
      { _id: new ObjectId(challengeId) },
      { 
        $set: { 
          name: newName.trim(),
          updatedAt: new Date()
        }
      }
    );

    const updatedChallenge = await db.collection('challenges').findOne({ _id: new ObjectId(challengeId) });

    console.log('✅ Challenge renamed to:', newName);

    return updatedChallenge;
  },

  exitChallenge: async (_, { userChallengeId, reason }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const userChallenge = await db.collection('userChallenges').findOne({ 
      _id: new ObjectId(userChallengeId) 
    });

    if (!userChallenge) {
      throw new Error('User challenge not found');
    }

    if (!userChallenge.userId.equals(user._id)) {
      throw new Error('Not authorized');
    }

    const challenge = await db.collection('challenges').findOne({ _id: userChallenge.challengeId });

    // Update challenge status to exited
    await db.collection('userChallenges').updateOne(
      { _id: new ObjectId(userChallengeId) },
      { 
        $set: { 
          status: 'exited',
          exitedAt: new Date(),
          exitReason: reason || null
        }
      }
    );

    // Update user stats
    await db.collection('users').updateOne(
      { _id: user._id },
      { $inc: { 'stats.activeChallenges': -1 } }
    );

    // Update challenge stats
    await db.collection('challenges').updateOne(
      { _id: userChallenge.challengeId },
      { $inc: { 'stats.activeUsers': -1 } }
    );

    // Notify partners about exit
    if (userChallenge.partnerIds && userChallenge.partnerIds.length > 0) {
      const notifications = userChallenge.partnerIds.map(partnerId => ({
        userId: partnerId,
        type: 'challenge_exit',
        title: `${user.displayName} has left the challenge`,
        message: `${user.displayName} exited "${challenge.name}"${reason ? `: ${reason}` : '.'}`,
        challengeId: userChallenge.challengeId,
        exitedBy: user._id,
        read: false,
        createdAt: new Date()
      }));

      await db.collection('notifications').insertMany(notifications);

      // Send email notifications to partners
      for (const partnerId of userChallenge.partnerIds) {
        const partner = await db.collection('users').findOne({ _id: partnerId });
        if (partner?.settings?.notifications?.enabled && partner?.emailConfig?.enabled) {
          try {
            await sendChallengeExitEmail(
              partner.email,
              partner.displayName,
              challenge.name,
              user.displayName,
              reason || null
            );
          } catch (error) {
            console.error('Failed to send exit email to partner:', error.message);
          }
        }
      }
    }

    console.log('✅ User exited challenge:', challenge.name);

    return true;
  },

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  
  markNotificationRead: async (_, { id }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    await db.collection('notifications').updateOne(
      { _id: new ObjectId(id), userId: user._id },
      { $set: { read: true, readAt: new Date() } }
    );

    return await db.collection('notifications').findOne({ _id: new ObjectId(id) });
  },

  markAllNotificationsRead: async (_, __, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    await db.collection('notifications').updateMany(
      { userId: user._id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    return true;
  },

  // ============================================================
  // CERTIFICATES
  // ============================================================

  generateCertificate: async (_, { userChallengeId }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const userChallenge = await db.collection('userChallenges').findOne({ 
      _id: new ObjectId(userChallengeId),
      userId: user._id
    });

    if (!userChallenge) {
      throw new Error('Challenge not found');
    }

    const challenge = await db.collection('challenges').findOne({ _id: userChallenge.challengeId });

    // Determine certificate type based on achievement
    let type = 'completion';
    let title = `Challenge Completion`;
    let description = `Successfully completed ${challenge.name}`;

    if (userChallenge.longestStreak >= 100) {
      type = 'streak_master';
      title = '100+ Day Streak Master';
      description = `Achieved a ${userChallenge.longestStreak} day streak in ${challenge.name}`;
    } else if (userChallenge.longestStreak >= 30) {
      type = 'streak_champion';
      title = '30+ Day Streak Champion';
    } else if (userChallenge.completionRate >= 90) {
      type = 'high_achiever';
      title = 'High Achiever - 90%+ Completion';
    }

    const certificate = {
      userId: user._id,
      type,
      title,
      description,
      challengeId: userChallenge.challengeId,
      achievementDate: new Date(),
      imageUrl: null, // Could generate image URL here
      userChallengeId: userChallenge._id,
      stats: {
        streak: userChallenge.longestStreak,
        checkIns: userChallenge.totalCheckIns,
        completionRate: userChallenge.completionRate
      }
    };

    const result = await db.collection('certificates').insertOne(certificate);

    console.log('✅ Certificate generated:', type, 'for', user.displayName);

    return { ...certificate, _id: result.insertedId };
  },

  // ============================================================
  // CHAT/MESSAGING
  // ============================================================

  sendMessage: async (_, { toUserId, message }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const chatMessage = {
      fromUserId: user._id,
      toUserId: new ObjectId(toUserId),
      message,
      read: false,
      createdAt: new Date()
    };

    const result = await db.collection('chatMessages').insertOne(chatMessage);

    // Create notification for recipient
    await db.collection('notifications').insertOne({
      userId: new ObjectId(toUserId),
      type: 'new_message',
      title: `New message from ${user.displayName}`,
      message: message.substring(0, 100),
      read: false,
      createdAt: new Date()
    });

    console.log('✅ Message sent from', user.displayName, 'to', toUserId);

    return { ...chatMessage, _id: result.insertedId };
  },

  markChatMessageRead: async (_, { messageId }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    await db.collection('chatMessages').updateOne(
      { _id: new ObjectId(messageId), toUserId: user._id },
      { $set: { read: true, readAt: new Date() } }
    );

    return await db.collection('chatMessages').findOne({ _id: new ObjectId(messageId) });
  },

  // ============================================================
  // PUSH NOTIFICATIONS
  // ============================================================

  subscribePushNotification: async (_, { subscription }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    await db.collection('pushSubscriptions').updateOne(
      { userId: user._id },
      { 
        $set: { 
          subscription: JSON.parse(subscription),
          updatedAt: new Date()
        },
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    );

    console.log('✅ Push notification subscription saved for', user.displayName);

    return true;
  },

  // ============================================================
  // FEATURE REQUESTS
  // ============================================================

  submitFeatureRequest: async (_, { title, description, category }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const featureRequest = {
      userId: user._id,
      title,
      description,
      category: category || 'general',
      status: 'pending',
      votes: 1,
      votedBy: [user._id],
      adminNote: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('featureRequests').insertOne(featureRequest);

    console.log('✅ Feature request submitted:', title);

    // Return with proper ID mapping for GraphQL
    return { 
      ...featureRequest, 
      _id: result.insertedId,
      id: result.insertedId.toString()
    };
  },

  voteFeatureRequest: async (_, { requestId }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const request = await db.collection('featureRequests').findOne({ _id: new ObjectId(requestId) });
    if (!request) {
      throw new Error('Feature request not found');
    }

    const hasVoted = request.votedBy.some(id => id.equals(user._id));

    if (hasVoted) {
      // Remove vote
      await db.collection('featureRequests').updateOne(
        { _id: new ObjectId(requestId) },
        {
          $pull: { votedBy: user._id },
          $inc: { votes: -1 },
          $set: { updatedAt: new Date() }
        }
      );
    } else {
      // Add vote
      await db.collection('featureRequests').updateOne(
        { _id: new ObjectId(requestId) },
        {
          $push: { votedBy: user._id },
          $inc: { votes: 1 },
          $set: { updatedAt: new Date() }
        }
      );
    }

    return await db.collection('featureRequests').findOne({ _id: new ObjectId(requestId) });
  },

  updateFeatureRequestStatus: async (_, { requestId, status, adminNote }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check if user is admin using role field
    const adminUser = await db.collection('users').findOne({ _id: user._id });
    if (adminUser?.role !== 'admin' && !adminUser?.isAdmin) {
      throw new Error('Admin access required');
    }

    await db.collection('featureRequests').updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status,
          adminNote: adminNote || null,
          updatedAt: new Date()
        }
      }
    );

    console.log('✅ Feature request status updated:', requestId, status);

    return await db.collection('featureRequests').findOne({ _id: new ObjectId(requestId) });
  },

  // ============================================================
  // FEEDBACK
  // ============================================================
  
  sendFeedback: async (_, { name, email, subject, message }, { db }) => {
    try {
      // Store feedback in database
      const feedback = {
        name,
        email,
        subject,
        message,
        createdAt: new Date(),
        status: 'pending' // pending, reviewed, resolved
      };

      const result = await db.collection('feedback').insertOne(feedback);

      // Send email notification to admin users from database
      try {
        console.log('📧 [FEEDBACK] Starting email notification process...');
        console.log('📧 [FEEDBACK] Environment check - ADMIN_EMAIL:', process.env.ADMIN_EMAIL ? 'SET' : 'NOT SET');
        console.log('📧 [FEEDBACK] Environment check - ADMIN_EMAIL_PASSWORD:', process.env.ADMIN_EMAIL_PASSWORD ? 'SET (length: ' + process.env.ADMIN_EMAIL_PASSWORD.length + ')' : 'NOT SET');
        
        await sendFeedbackNotificationToAdmins({
          name,
          email,
          subject,
          message,
          createdAt: feedback.createdAt
        }, db); // Pass database to get admin users
        
        console.log('✅ [FEEDBACK] Email notification sent successfully to all admins!');
      } catch (emailError) {
        console.error('❌ [FEEDBACK] Failed to send email notification:', emailError.message);
        console.error('❌ [FEEDBACK] Error stack:', emailError.stack);
        // Don't fail the mutation if email fails - feedback is still saved
      }

      console.log('✅ Feedback received from:', email, '- Subject:', subject);

      return {
        success: true,
        message: 'Thank you for your feedback! We will review it shortly.'
      };
    } catch (error) {
      console.error('❌ Error saving feedback:', error);
      return {
        success: false,
        message: 'Failed to submit feedback. Please try again later.'
      };
    }
  },

  updateFeedbackStatus: async (_, { feedbackId, status }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check if user is admin using role field
    const adminUser = await db.collection('users').findOne({ _id: user._id });
    if (adminUser?.role !== 'admin' && !adminUser?.isAdmin) {
      throw new Error('Admin access required');
    }

    const result = await db.collection('feedback').findOneAndUpdate(
      { _id: new ObjectId(feedbackId) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Feedback not found');
    }

    return {
      ...result,
      id: result._id.toString(),
      createdAt: result.createdAt ? result.createdAt.toISOString() : null,
      updatedAt: result.updatedAt ? result.updatedAt.toISOString() : null
    };
  },

  addFeedbackNote: async (_, { feedbackId, note }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check if user is admin using role field
    const adminUser = await db.collection('users').findOne({ _id: user._id });
    if (adminUser?.role !== 'admin' && !adminUser?.isAdmin) {
      throw new Error('Admin access required');
    }

    const result = await db.collection('feedback').findOneAndUpdate(
      { _id: new ObjectId(feedbackId) },
      { $set: { adminNotes: note, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    if (!result) {
      throw new Error('Feedback not found');
    }

    return {
      ...result,
      id: result._id.toString(),
      createdAt: result.createdAt ? result.createdAt.toISOString() : null,
      updatedAt: result.updatedAt ? result.updatedAt.toISOString() : null
    };
  },

  // ============================================================
  // SYSTEM SETTINGS (Admin Only)
  // ============================================================

  updateSystemSettings: async (_, { aiCoachEnabled }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check if user is admin
    const adminUser = await db.collection('users').findOne({ _id: user._id });
    if (adminUser?.role !== 'admin' && !adminUser?.isAdmin) {
      throw new Error('Admin access required');
    }

    const updatedAt = new Date();

    await db.collection('systemSettings').updateOne(
      { key: 'global' },
      {
        $set: {
          aiCoachEnabled,
          updatedAt,
          updatedBy: user._id
        }
      },
      { upsert: true }
    );

    console.log('✅ System settings updated: AI Coach', aiCoachEnabled ? 'enabled' : 'disabled');

    return {
      aiCoachEnabled,
      updatedAt: updatedAt.toISOString(),
      updatedBy: user._id.toString()
    };
  },

  // Join a specific user challenge instance (from invitation)
  joinUserChallengeInstance: async (_, { userChallengeId }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Get the original user challenge instance
    const originalInstance = await db.collection('userChallenges').findOne({ 
      _id: new ObjectId(userChallengeId)
    });

    if (!originalInstance) {
      throw new Error('Challenge instance not found');
    }

    // Get the challenge
    const challenge = await db.collection('challenges').findOne({ _id: originalInstance.challengeId });
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Check if user already has an active instance of this exact challenge
    const existingActiveChallenge = await db.collection('userChallenges').findOne({
      userId: user._id,
      challengeId: originalInstance.challengeId,
      status: 'active'
    });

    if (existingActiveChallenge) {
      throw new Error('You already have an active instance of this challenge. Complete or exit the current one before joining again.');
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + challenge.duration);

    // Get the owner of the original instance
    const originalOwner = await db.collection('users').findOne({ _id: originalInstance.userId });

    // Create new user challenge instance with original owner as partner
    const newUserChallenge = {
      userId: user._id,
      challengeId: originalInstance.challengeId,
      partners: [originalInstance.userId], // Add original owner as partner
      currentStreak: 0,
      longestStreak: 0,
      totalCheckIns: 0,
      missedDays: 0,
      graceSkipsUsed: 0,
      completionRate: 0,
      status: 'active',
      checkIns: [],
      taskProgress: challenge.tasks?.map(task => ({
        taskId: task.id,
        completed: false,
        completedCount: 0
      })) || [],
      startDate,
      endDate,
      notificationTime: '09:00',
      reminderEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('userChallenges').insertOne(newUserChallenge);

    // Add new user as partner to the original instance
    await db.collection('userChallenges').updateOne(
      { _id: originalInstance._id },
      { $addToSet: { partners: user._id } }
    );

    // Make them friends automatically
    await db.collection('users').updateOne(
      { _id: user._id },
      { $addToSet: { friends: originalInstance.userId } }
    );

    await db.collection('users').updateOne(
      { _id: originalInstance.userId },
      { $addToSet: { friends: user._id } }
    );

    console.log(`✅ User ${user._id} joined challenge instance and became friends with ${originalInstance.userId}`);

    // Return the new user challenge
    return {
      ...newUserChallenge,
      id: result.insertedId.toString(),
      _id: result.insertedId,
      user,
      challenge,
      partners: [originalOwner],
      checkIns: [],
      lastCheckIn: null,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  },

  // ============================================================
  // IMAGE UPLOAD
  // ============================================================
  
  uploadImage: async (_, { base64 }, { user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Photo upload is currently disabled
    throw new Error('Photo upload feature is currently disabled. Please contact support for more information.');
    
    // Uncomment below to enable photo uploads:
    // const result = await uploadToCloudinary(base64);
    // return result.url;
  },
};

export default Mutation;
