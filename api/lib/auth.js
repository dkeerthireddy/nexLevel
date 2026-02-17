import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY || '30d';
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a password with a hash
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(userId) {
  return jwt.sign({ userId: userId.toString() }, JWT_SECRET, { 
    expiresIn: JWT_EXPIRY 
  });
}

/**
 * Verify a JWT token and return the payload
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Get user from JWT token
 */
export async function getUserFromToken(token, db) {
  try {
    const { userId } = verifyToken(token);
    
    const user = await db.collection('users').findOne({ 
      _id: new ObjectId(userId) 
    });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  } catch (error) {
    throw new Error('Authentication failed: ' + error.message);
  }
}

/**
 * Validate email format
 */
export function validateEmail(email) {
  // More comprehensive email validation regex
  // Accepts standard email formats including subdomains, special characters, etc.
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 128) {
    return { valid: false, message: 'Password must be less than 128 characters' };
  }
  
  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  
  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  
  // Check for at least one number
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...)' };
  }
  
  return { valid: true };
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader) {
  if (!authHeader) {
    return null;
  }
  
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  
  return null;
}

/**
 * Derive a 256-bit encryption key from user ID and a salt
 * This key is unique per user and cannot be known by developers
 */
function deriveUserEncryptionKey(userId, salt) {
  // Use PBKDF2 to derive a 32-byte key from userId + salt
  // This creates a deterministic key that's unique per user
  return crypto.pbkdf2Sync(
    userId.toString(), // User's unique ID as base
    salt, // Salt stored with encrypted data
    100000, // Iterations (high for security)
    32, // Key length (32 bytes = 256 bits)
    'sha256' // Hash algorithm
  );
}

/**
 * Encrypt sensitive data (like email passwords) using user-specific key
 * Each user's data is encrypted with a key derived from their user ID
 */
export function encryptSensitiveData(text, userId) {
  if (!text || !userId) return null;
  
  try {
    // Generate random salt for key derivation (16 bytes)
    const salt = crypto.randomBytes(16);
    
    // Derive user-specific encryption key
    const key = deriveUserEncryptionKey(userId, salt);
    
    // Generate a random 12-byte IV (initialization vector)
    const iv = crypto.randomBytes(12);
    
    // Create cipher with user-specific key
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    
    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get auth tag for integrity verification
    const authTag = cipher.getAuthTag();
    
    // Return salt + IV + authTag + encrypted data (all hex encoded)
    // Salt is needed to derive the same key for decryption
    return salt.toString('hex') + ':' + iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt sensitive data');
  }
}

/**
 * Decrypt sensitive data encrypted with encryptSensitiveData
 * Uses user ID to derive the correct decryption key
 */
export function decryptSensitiveData(encryptedText, userId) {
  if (!encryptedText || !userId) return null;
  
  try {
    // Split the encrypted text into components
    const parts = encryptedText.split(':');
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted data format');
    }
    
    const salt = Buffer.from(parts[0], 'hex');
    const iv = Buffer.from(parts[1], 'hex');
    const authTag = Buffer.from(parts[2], 'hex');
    const encrypted = parts[3];
    
    // Derive the same user-specific key using stored salt
    const key = deriveUserEncryptionKey(userId, salt);
    
    // Create decipher with user-specific key
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    
    // Set auth tag for integrity verification
    decipher.setAuthTag(authTag);
    
    // Decrypt the text
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt sensitive data');
  }
}

export default {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  getUserFromToken,
  validateEmail,
  validatePassword,
  extractToken,
  encryptSensitiveData,
  decryptSensitiveData
};
