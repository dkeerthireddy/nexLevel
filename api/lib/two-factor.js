import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate 2FA secret for user
 */
export async function generateTwoFactorSecret(userEmail) {
  const secret = speakeasy.generateSecret({
    name: `StreakMate (${userEmail})`,
    length: 32
  });

  // Generate QR code
  const qrCode = await QRCode.toDataURL(secret.otpauth_url);

  // Generate backup codes
  const backupCodes = generateBackupCodes();

  return {
    secret: secret.base32,
    qrCode,
    backupCodes
  };
}

/**
 * Generate backup codes
 */
function generateBackupCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

/**
 * Verify 2FA token
 */
export function verifyTwoFactorToken(secret, token) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps before/after for clock drift
  });
}

/**
 * Verify backup code
 */
export async function verifyBackupCode(db, userId, code) {
  const user = await db.collection('users').findOne({ _id: userId });
  
  if (!user?.twoFactorBackupCodes) {
    return false;
  }

  const codeIndex = user.twoFactorBackupCodes.indexOf(code.toUpperCase());
  
  if (codeIndex === -1) {
    return false;
  }

  // Remove used backup code
  const updatedCodes = [...user.twoFactorBackupCodes];
  updatedCodes.splice(codeIndex, 1);

  await db.collection('users').updateOne(
    { _id: userId },
    { $set: { twoFactorBackupCodes: updatedCodes } }
  );

  return true;
}

/**
 * Enable 2FA for user
 */
export async function enableTwoFactorForUser(db, userId, secret, backupCodes) {
  await db.collection('users').updateOne(
    { _id: userId },
    {
      $set: {
        twoFactorSecret: secret,
        twoFactorEnabled: true,
        twoFactorBackupCodes: backupCodes,
        twoFactorEnabledAt: new Date()
      }
    }
  );
}

/**
 * Disable 2FA for user
 */
export async function disableTwoFactorForUser(db, userId) {
  await db.collection('users').updateOne(
    { _id: userId },
    {
      $unset: {
        twoFactorSecret: '',
        twoFactorBackupCodes: ''
      },
      $set: {
        twoFactorEnabled: false,
        twoFactorDisabledAt: new Date()
      }
    }
  );
}

export default {
  generateTwoFactorSecret,
  verifyTwoFactorToken,
  verifyBackupCode,
  enableTwoFactorForUser,
  disableTwoFactorForUser
};
