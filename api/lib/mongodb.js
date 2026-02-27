import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
// Extract database name from URI or use environment variable
let dbName = process.env.MONGODB_DB_NAME;
if (!dbName && uri) {
  // Try to extract database name from connection string
  const match = uri.match(/mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)/);
  if (match && match[1]) {
    dbName = match[1];
  } else {
    dbName = 'nexlevel_db'; // fallback
  }
}

let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB Atlas
 * Uses connection pooling and caching for serverless environments
 */
export async function connectToDatabase() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    // Create new MongoDB client
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // Connect to MongoDB
    await client.connect();

    // Get database
    const db = client.db(dbName);

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

/**
 * Get database instance (assumes connection is already established)
 */
export async function getDatabase() {
  if (cachedDb) {
    return cachedDb;
  }
  
  const { db } = await connectToDatabase();
  return db;
}

/**
 * Close MongoDB connection (for cleanup)
 */
export async function closeDatabase() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;

  }
}

/**
 * Helper function to safely create index (skip if exists)
 */
async function createIndexSafely(collection, keys, options = {}) {
  try {
    const indexName = options.name || Object.keys(keys).map(k => `${k}_${keys[k]}`).join('_');
    
    // Check if index already exists
    const existingIndexes = await collection.indexes();
    const indexExists = existingIndexes.some(idx => {
      // Check by name or by key pattern
      if (idx.name === indexName) return true;
      return JSON.stringify(idx.key) === JSON.stringify(keys);
    });

    if (indexExists) {

      return;
    }

    // Create the index
    await collection.createIndex(keys, options);

  } catch (error) {
    // If error is "index already exists", ignore it
    if (error.message.includes('already exists') || error.code === 85 || error.code === 86) {

    } else {
      console.warn(`  ⚠️  Failed to create index:`, error.message);
    }
  }
}

/**
 * Initialize database with indexes for optimal performance
 */
export async function initializeIndexes(db) {
  try {

    // Users indexes

    await createIndexSafely(db.collection('users'), { email: 1 }, { unique: true, name: 'email_unique' });
    await createIndexSafely(db.collection('users'), { friendIds: 1 });
    await createIndexSafely(db.collection('users'), { createdAt: -1 });

    // Challenges indexes

    await createIndexSafely(db.collection('challenges'), { category: 1, isTemplate: 1 });
    await createIndexSafely(db.collection('challenges'), { createdBy: 1 });
    await createIndexSafely(db.collection('challenges'), { 'stats.activeUsers': -1 });

    // UserChallenges indexes (CRITICAL for performance)

    await createIndexSafely(db.collection('userChallenges'), { userId: 1, status: 1 });
    await createIndexSafely(db.collection('userChallenges'), { challengeId: 1 });
    await createIndexSafely(db.collection('userChallenges'), { partnerIds: 1 });
    await createIndexSafely(db.collection('userChallenges'), { lastCheckInAt: -1 });
    await createIndexSafely(db.collection('userChallenges'), { 
      userId: 1, 
      status: 1, 
      lastCheckInAt: -1 
    });

    // CheckIns indexes

    await createIndexSafely(db.collection('checkIns'), { userChallengeId: 1, date: -1 });
    await createIndexSafely(db.collection('checkIns'), { userId: 1, date: -1 });
    await createIndexSafely(db.collection('checkIns'), { challengeId: 1 });
    await createIndexSafely(db.collection('checkIns'), { date: 1 });

    // AI Messages indexes

    await createIndexSafely(db.collection('aiMessages'), { userId: 1, createdAt: -1 });
    await createIndexSafely(db.collection('aiMessages'), { expiresAt: 1 }, { expireAfterSeconds: 0 });

    // AI Insights indexes

    await createIndexSafely(db.collection('aiInsights'), { userId: 1 }, { unique: true });
    await createIndexSafely(db.collection('aiInsights'), { nextUpdateAt: 1 });

    // Notifications indexes

    await createIndexSafely(db.collection('notifications'), { userId: 1, read: 1, createdAt: -1 });

  } catch (error) {
    console.error('⚠️ Error initializing indexes:', error.message);
    // Don't throw - indexes are optional for functionality
  }
}

export default { connectToDatabase, getDatabase, closeDatabase, initializeIndexes };
