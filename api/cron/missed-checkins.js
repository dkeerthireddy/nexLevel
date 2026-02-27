import dotenv from 'dotenv';
import { connectToDatabase } from '../lib/mongodb.js';

dotenv.config();

/**
 * Missed Check-ins Cron Job
 * Runs daily at midnight to detect missed check-ins
 * Vercel cron: 0 0 * * *
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

    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    // Find all active challenges
    const userChallenges = await db.collection('userChallenges')
      .find({ status: 'active' })
      .toArray();

    let missedCheckIns = 0;
    let streaksReset = 0;
    let notificationsSent = 0;

    for (const uc of userChallenges) {
      // Get challenge to check tasks
      const challenge = await db.collection('challenges').findOne({ _id: uc.challengeId });
      
      // Check how many tasks user checked in yesterday
      const checkInsYesterday = await db.collection('checkIns')
        .find({
          userChallengeId: uc._id,
          date: yesterday,
        })
        .toArray();

      // If challenge has tasks, check if ALL tasks were completed
      // If no tasks, check if at least one check-in exists
      const hasTasks = challenge?.tasks && challenge.tasks.length > 0;
      const missedCheckIn = hasTasks 
        ? checkInsYesterday.length < challenge.tasks.length
        : checkInsYesterday.length === 0;

      if (missedCheckIn) {
        // User missed check-in (full or partial)
        missedCheckIns++;
        
        // Calculate how many tasks were missed
        const tasksCompleted = checkInsYesterday.length;
        const totalTasks = hasTasks ? challenge.tasks.length : 1;
        const tasksMissed = totalTasks - tasksCompleted;

        // Check if grace skips are allowed
        let shouldResetStreak = true;
        if (challenge?.allowGraceSkips && uc.graceSkipsUsed < (challenge.graceSkipsPerWeek || 1)) {
          // Use grace skip
          await db.collection('userChallenges').updateOne(
            { _id: uc._id },
            { 
              $inc: { 
                graceSkipsUsed: 1,
                missedDays: 1
              }
            }
          );
          shouldResetStreak = false;

        } else {
          // Reset streak
          await db.collection('userChallenges').updateOne(
            { _id: uc._id },
            { 
              $inc: { missedDays: 1 },
              $set: { currentStreak: 0 }
            }
          );
          streaksReset++;

        }

        // Get user for notification settings
        const user = await db.collection('users').findOne({ _id: uc.userId });
        
        // Create notification if user wants them
        if (user?.settings?.notifications?.enabled) {
          const taskMessage = hasTasks 
            ? `You missed ${tasksMissed} task(s) yesterday. `
            : `You missed yesterday's check-in. `;
          
          const streakMessage = shouldResetStreak 
            ? `Your streak was reset. Don't worry, start fresh today! 💪`
            : `We used a grace skip for you. Keep going! 🎯`;

          const notification = {
            userId: uc.userId,
            type: 'missed_checkin',
            title: 'Missed Check-in Yesterday',
            message: taskMessage + streakMessage,
            challengeId: uc.challengeId,
            read: false,
            createdAt: new Date(),
          };

          await db.collection('notifications').insertOne(notification);
          
          // Send email notification if configured
          if (user.emailConfig?.enabled) {
            try {
              const { sendNotificationEmail } = await import('../lib/email.js');
              await sendNotificationEmail(
                user.email,
                user.displayName,
                notification,
                user.emailConfig,
                uc.userId
              );

            } catch (emailError) {
              console.error(`Failed to send missed check-in email to ${user.email}:`, emailError.message);
            }
          }
          
          notificationsSent++;
        }
      }
    }

    // Check for completed challenges
    const completedChallenges = await db.collection('userChallenges')
      .find({
        status: 'active',
        endDate: { $lte: new Date() }
      })
      .toArray();

    for (const uc of completedChallenges) {
      // Mark as completed
      await db.collection('userChallenges').updateOne(
        { _id: uc._id },
        { 
          $set: { 
            status: 'completed',
            completedAt: new Date()
          }
        }
      );

      // Update user stats
      await db.collection('users').updateOne(
        { _id: uc.userId },
        { 
          $inc: { 
            'stats.activeChallenges': -1,
            'stats.completedChallenges': 1
          }
        }
      );

      // Update challenge stats
      await db.collection('challenges').updateOne(
        { _id: uc.challengeId },
        { $inc: { 'stats.activeUsers': -1 } }
      );

      // Send congratulations notification
      const user = await db.collection('users').findOne({ _id: uc.userId });
      const challenge = await db.collection('challenges').findOne({ _id: uc.challengeId });

      if (user?.settings?.notifications?.enabled) {
        await db.collection('notifications').insertOne({
          userId: uc.userId,
          type: 'challenge_completed',
          title: `🎉 Challenge Completed!`,
          message: `Congratulations! You've completed "${challenge?.name}". Amazing work! 🏆`,
          challengeId: uc.challengeId,
          read: false,
          createdAt: new Date(),
        });
        notificationsSent++;
      }

    }





    return res.status(200).json({
      success: true,
      missedCheckIns,
      streaksReset,
      notificationsSent,
      challengesCompleted: completedChallenges.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in missed check-ins:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
