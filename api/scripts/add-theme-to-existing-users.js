import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/accountability-app';

async function addThemeToExistingUsers() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Find all users without theme setting
    const usersWithoutTheme = await usersCollection.find({
      'settings.theme': { $exists: false }
    }).toArray();

    console.log(`Found ${usersWithoutTheme.length} users without theme setting`);

    if (usersWithoutTheme.length > 0) {
      // Update all users to have default 'light' theme
      const result = await usersCollection.updateMany(
        { 'settings.theme': { $exists: false } },
        { 
          $set: { 
            'settings.theme': 'light',
            updatedAt: new Date()
          } 
        }
      );

      console.log(`✅ Updated ${result.modifiedCount} users with default theme setting`);
    } else {
      console.log('✅ All users already have theme setting');
    }

  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

addThemeToExistingUsers();
