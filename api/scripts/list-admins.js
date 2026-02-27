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

    await client.connect();

    const db = client.db();
    
    // Find all admin users
    const admins = await db.collection('users').find({ role: 'admin' }).toArray();
    
    if (admins.length === 0) {



    } else {

      admins.forEach((admin, index) => {




        console.log(`   Created: ${admin.createdAt?.toLocaleDateString()}`);
        console.log(`   Last Login: ${admin.lastLoginAt ? admin.lastLoginAt.toLocaleDateString() : 'Never'}`);

      });
    }

    // Show total users
    const totalUsers = await db.collection('users').countDocuments();



  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();

  }
}

listAdmins();
