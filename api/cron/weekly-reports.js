import dotenv from 'dotenv';
import { connectToDatabase } from '../lib/mongodb.js';
import { generateWeeklyReport } from '../lib/gemini.js';

dotenv.config();

/**
 * Weekly Reports Cron Job
 * Runs every Sunday at 8 PM (20:00)
 * Vercel cron: 0 20 * * 0
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
    
    console.log('📊 Running weekly reports generation...');

    // Get all users who have AI reports enabled
    const users = await db.collection('users')
      .find({ 
        'settings.ai.weeklyReports': true,
        'stats.activeChallenges': { $gt: 0 } // Only users with active challenges
      })
      .toArray();

    let reportsGenerated = 0;
    let errors = 0;

    for (const user of users) {
      try {
        // Get user's week data
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);

        const userChallenges = await db.collection('userChallenges')
          .find({ 
            userId: user._id,
            status: { $in: ['active', 'completed'] }
          })
          .toArray();

        const checkIns = await db.collection('checkIns')
          .find({
            userId: user._id,
            date: { $gte: weekAgo }
          })
          .toArray();

        if (userChallenges.length === 0) {
          console.log(`⊘ Skipping user ${user.email} - no active challenges`);
          continue;
        }

        // Calculate stats per challenge
        const challengeStats = await Promise.all(
          userChallenges.map(async (uc) => {
            const challenge = await db.collection('challenges').findOne({ _id: uc.challengeId });
            const challengeCheckIns = checkIns.filter(
              ci => ci.userChallengeId.equals(uc._id)
            );

            return {
              name: challenge?.name || 'Challenge',
              checkIns: challengeCheckIns.length,
              expected: 7,
              rate: ((challengeCheckIns.length / 7) * 100).toFixed(0),
              streak: uc.currentStreak,
            };
          })
        );

        // Generate AI report
        const content = await generateWeeklyReport(challengeStats);

        // Save to aiMessages
        await db.collection('aiMessages').insertOne({
          userId: user._id,
          type: 'insight',
          content: content.trim(),
          challengeId: null,
          triggeredBy: 'weekly_analysis',
          generated: true,
          model: 'gemini-2.0-flash',
          cached: false,
          read: false,
          liked: null,
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        // Create notification
        await db.collection('notifications').insertOne({
          userId: user._id,
          type: 'weekly_report',
          title: 'Your Weekly Progress Report is Ready! 📊',
          message: 'See how you did this week and get personalized insights',
          read: false,
          createdAt: new Date(),
        });

        reportsGenerated++;
        console.log(`✓ Generated weekly report for ${user.email}`);

        // Rate limiting: wait 4 seconds between users (15 RPM = 1 every 4 sec)
        if (reportsGenerated < users.length) {
          await new Promise(resolve => setTimeout(resolve, 4000));
        }

      } catch (error) {
        console.error(`❌ Failed to generate report for user ${user.email}:`, error.message);
        errors++;
      }
    }

    console.log(`✅ Weekly reports complete: ${reportsGenerated} generated, ${errors} errors`);

    return res.status(200).json({
      success: true,
      reportsGenerated,
      errors,
      totalUsers: users.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in weekly reports:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
