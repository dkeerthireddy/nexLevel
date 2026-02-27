import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/accountability-app';

async function addThemeToExistingUsers() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();

    const db = client.db();
    const usersCollection = db.collection('users');

    // Find all users without theme setting
    const usersWithoutTheme = await usersCollection.find({
      'settings.theme': { $exists: false }
    }).toArray();

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

    } else {

    }

  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  } finally {
    await client.close();

  }
}

addThemeToExistingUsers();
