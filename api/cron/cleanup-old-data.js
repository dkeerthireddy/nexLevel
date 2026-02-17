import dotenv from 'dotenv';
import { connectToDatabase } from '../lib/mongodb.js';

dotenv.config();

/**
 * Cleanup Old Data Cron Job
 * Runs daily at 2 AM to clean up expired data
 * Vercel cron: 0 2 * * *
 */
export default async function handler(req, res) {
  // Verify Vercel Cron secret
  const authHeader = req.headers.authorization || '';
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { db } = await connectToDatabase();
    
    console.log('🧹 Running data cleanup...');

    const now = new Date();
    let totalDeleted = 0;

    // Delete expired AI messages (older than expiry date)
    const expiredMessages = await db.collection('aiMessages').deleteMany({
      expiresAt: { $lt: now }
    });
    console.log(`✓ Deleted ${expiredMessages.deletedCount} expired AI messages`);
    totalDeleted += expiredMessages.deletedCount;

    // Delete old notifications (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const oldNotifications = await db.collection('notifications').deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      read: true // Only delete read notifications
    });
    console.log(`✓ Deleted ${oldNotifications.deletedCount} old notifications`);
    totalDeleted += oldNotifications.deletedCount;

    // Archive old completed challenges (older than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const archivedChallenges = await db.collection('userChallenges').updateMany(
      {
        status: 'completed',
        completedAt: { $lt: ninetyDaysAgo }
      },
      {
        $set: { status: 'archived' }
      }
    );
    console.log(`✓ Archived ${archivedChallenges.modifiedCount} old completed challenges`);

    // Reset weekly grace skips (runs on Sunday/Monday)
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 1) { // Sunday or Monday
      const resetResult = await db.collection('userChallenges').updateMany(
        { status: 'active' },
        { $set: { graceSkipsUsed: 0 } }
      );
      console.log(`✓ Reset grace skips for ${resetResult.modifiedCount} active challenges`);
    }

    // Log database stats
    const stats = await db.stats();
    const collections = {
      users: await db.collection('users').countDocuments(),
      challenges: await db.collection('challenges').countDocuments(),
      userChallenges: await db.collection('userChallenges').countDocuments(),
      checkIns: await db.collection('checkIns').countDocuments(),
      aiMessages: await db.collection('aiMessages').countDocuments(),
      notifications: await db.collection('notifications').countDocuments(),
    };

    console.log('📊 Database stats:');
    console.log(`   - Total size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   - Users: ${collections.users}`);
    console.log(`   - Challenges: ${collections.challenges}`);
    console.log(`   - User Challenges: ${collections.userChallenges}`);
    console.log(`   - Check-ins: ${collections.checkIns}`);
    console.log(`   - AI Messages: ${collections.aiMessages}`);
    console.log(`   - Notifications: ${collections.notifications}`);

    console.log(`✅ Cleanup complete: ${totalDeleted} items deleted`);

    return res.status(200).json({
      success: true,
      deletedItems: totalDeleted,
      archivedChallenges: archivedChallenges.modifiedCount,
      databaseStats: {
        sizeInMB: (stats.dataSize / 1024 / 1024).toFixed(2),
        collections
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in cleanup:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
