import crypto from 'crypto';
import { sendPasswordResetEmail, sendEmailVerificationEmail } from './email.js';

/**
 * Generate a secure random token
 */
export function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create password reset token and store in DB
 */
export async function createPasswordResetToken(db, email) {
  // Case-insensitive email search
  const user = await db.collection('users').findOne({ 
    email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
  });
  
  if (!user) {
    // Don't reveal if email exists - security best practice
    return { success: true, message: 'If email exists, reset link sent' };
  }

  const token = generateToken();
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await db.collection('passwordResets').insertOne({
    userId: user._id,
    token,
    expires,
    used: false,
    createdAt: new Date()
  });

  // Send password reset email using admin email (like signup verification)
  try {
    await sendPasswordResetEmail(
      user.email,
      user.displayName,
      token
    );
  } catch (error) {
    console.error('Failed to send password reset email:', error.message);
    // Don't fail - we've created the token, email is optional
  }

  return { success: true, message: 'If email exists, reset link sent' };
}

/**
 * Verify password reset token
 */
export async function verifyPasswordResetToken(db, token) {
  const reset = await db.collection('passwordResets').findOne({
    token,
    used: false,
    expires: { $gt: new Date() }
  });

  if (!reset) {
    throw new Error('Invalid or expired reset token');
  }

  return reset;
}

/**
 * Mark reset token as used
 */
export async function markTokenUsed(db, token) {
  await db.collection('passwordResets').updateOne(
    { token },
    { $set: { used: true, usedAt: new Date() } }
  );
}

/**
 * Create email verification token
 */
export async function createEmailVerificationToken(db, userId) {
  const token = generateToken();
  const expires = new Date(Date.now() + 86400000); // 24 hours

  await db.collection('emailVerifications').updateOne(
    { userId },
    {
      $set: {
        token,
        expires,
        verified: false,
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  return token;
}

/**
 * Verify email verification token
 */
export async function verifyEmailToken(db, token) {
  const verification = await db.collection('emailVerifications').findOne({
    token,
    verified: false,
    expires: { $gt: new Date() }
  });

  if (!verification) {
    throw new Error('Invalid or expired verification token');
  }

  // Mark as verified
  await db.collection('emailVerifications').updateOne(
    { token },
    { $set: { verified: true, verifiedAt: new Date() } }
  );

  // Update user
  await db.collection('users').updateOne(
    { _id: verification.userId },
    { $set: { emailVerified: true } }
  );

  return verification.userId;
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(db, userId) {
  const user = await db.collection('users').findOne({ _id: userId });
  
  if (!user) {
    throw new Error('User not found');
  }

  if (user.emailVerified) {
    return { success: false, message: 'Email already verified' };
  }

  const token = await createEmailVerificationToken(db, userId);

  // Send email only if user has email configured
  if (user.emailConfig?.enabled) {
    try {
      await sendEmailVerificationEmail(
        user.email,
        user.displayName,
        token,
        user.emailConfig,
        user._id
      );
    } catch (error) {
      console.error('Failed to send verification email:', error.message);
      return { success: false, message: 'Failed to send verification email' };
    }
  }

  return { success: true, message: 'Verification email sent' };
}

export default {
  generateToken,
  createPasswordResetToken,
  verifyPasswordResetToken,
  markTokenUsed,
  createEmailVerificationToken,
  verifyEmailToken,
  sendVerificationEmail
};
