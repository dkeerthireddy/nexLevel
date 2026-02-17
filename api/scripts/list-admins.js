/**
 * List Admin Users Script
 * 
 * This script lists all users with admin role in the database.
 * 
 * Usage:
 *   node scripts/list-admins.js
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

async function listAdmins() {
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected to database\n');

    const db = client.db();
    
    // Find all admin users
    const admins = await db.collection('users').find({ role: 'admin' }).toArray();
    
    if (admins.length === 0) {
      console.log('ℹ️  No admin users found');
      console.log('\n💡 Tip: Create an admin user with:');
      console.log('   node scripts/make-admin.js email@example.com');
    } else {
      console.log(`👥 Found ${admins.length} admin user${admins.length > 1 ? 's' : ''}:\n`);
      
      admins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.displayName}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Email Verified: ${admin.emailVerified ? 'Yes' : 'No'}`);
        console.log(`   2FA Enabled: ${admin.twoFactorEnabled ? 'Yes' : 'No'}`);
        console.log(`   Created: ${admin.createdAt?.toLocaleDateString()}`);
        console.log(`   Last Login: ${admin.lastLoginAt ? admin.lastLoginAt.toLocaleDateString() : 'Never'}`);
        console.log('');
      });
    }

    // Show total users
    const totalUsers = await db.collection('users').countDocuments();
    console.log(`📊 Total users in database: ${totalUsers}`);
    console.log(`📊 Admin users: ${admins.length}`);
    console.log(`📊 Regular users: ${totalUsers - admins.length}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from database');
  }
}

listAdmins();
