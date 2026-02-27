/**
 * Make Admin Script
 * 
 * This script sets a user's role to "admin" in the database.
 * 
 * Usage:
 *   node scripts/make-admin.js email@example.com
 * 
 * Example:
 *   node scripts/make-admin.js admin@myapp.com
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: MONGODB_URI not found in .env file');
  process.exit(1);
}

async function makeAdmin(email) {
  if (!email) {
    console.error('❌ Error: Please provide an email address');

    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {

    await client.connect();

    const db = client.db();
    
    // Check if user exists
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      console.error(`❌ Error: User not found with email: ${email}`);

      process.exit(1);
    }

    // Check if already admin
    if (user.role === 'admin') {

      process.exit(0);
    }

    // Update user to admin
    const result = await db.collection('users').updateOne(
      { email },
      { $set: { role: 'admin', updatedAt: new Date() } }
    );

    if (result.modifiedCount === 1) {




      console.log(`   Role: admin (updated)`);

    } else {
      console.error('❌ Error: Failed to update user role');
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();

  }
}

// Get email from command line arguments
const email = process.argv[2];
makeAdmin(email);
