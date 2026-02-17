import dotenv from 'dotenv';
import { connectToDatabase } from '../lib/mongodb.js';

dotenv.config();

/**
 * Daily Reminders Cron Job
 * Runs every hour to send check-in reminders to users
 * Vercel cron: 0 * * * *
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
    const currentHour = new Date().getHours();
    
    console.log(`⏰ Running daily reminders for hour: ${currentHour}`);

    // Find users who need reminders at this hour
    const userChallenges = await db.collection('userChallenges')
      .aggregate([
        {
          $match: {
            status: 'active',
            reminderEnabled: true,
          }
        },
        {
          $addFields: {
            reminderHour: {
              $toInt: { $substr: ['$notificationTime', 0, 2] }
            }
          }
        },
        {
          $match: {
            reminderHour: currentHour
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $lookup: {
            from: 'challenges',
            localField: 'challengeId',
            foreignField: '_id',
            as: 'challenge'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $unwind: '$challenge'
        }
      ])
      .toArray();

    // Check if they haven't checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let remindersSent = 0;

    for (const uc of userChallenges) {
      // Check notification settings
      if (!uc.user.settings?.notifications?.enabled) {
        continue;
      }

      // Check quiet hours
      const quietHours = uc.user.settings?.notifications?.quietHours;
      if (quietHours) {
        const currentTime = `${currentHour.toString().padStart(2, '0')}:00`;
        if (currentTime >= quietHours.start || currentTime <= quietHours.end) {
          continue; // Skip during quiet hours
        }
      }

      // Check if daily reminder is enabled
      if (!uc.user.settings?.notifications?.types?.dailyReminder) {
        continue;
      }

      // Get all tasks for this challenge
      const tasks = uc.challenge.tasks || [];
      
      // Find tasks not checked in today
      const tasksCheckedInToday = await db.collection('checkIns')
        .find({
          userChallengeId: uc._id,
          date: today,
        })
        .toArray();
      
      const checkedTaskIds = new Set(tasksCheckedInToday.map(ci => ci.taskId));
      const pendingTasks = tasks.filter(task => !checkedTaskIds.has(task.id));

      if (pendingTasks.length > 0) {
        // Create notification with pending tasks
        const taskList = pendingTasks.map(t => t.title).join(', ');
        const message = tasks.length > 0 
          ? `You have ${pendingTasks.length} pending task(s): ${taskList}. Don't break your ${uc.currentStreak}-day streak! 💪`
          : `Don't break your ${uc.currentStreak}-day streak! Keep it going! 💪`;

        await db.collection('notifications').insertOne({
          userId: uc.userId,
          type: 'reminder',
          title: `Time for ${uc.challenge.name}! ⏰`,
          message: message,
          challengeId: uc.challengeId,
          read: false,
          createdAt: new Date(),
        });

        // Send email notification if user has email configured
        if (uc.user.emailConfig?.enabled) {
          try {
            const { sendNotificationEmail } = await import('../lib/email.js');
            await sendNotificationEmail(
              uc.user.email,
              uc.user.displayName,
              {
                type: 'challenge_reminder',
                title: `Time for ${uc.challenge.name}! ⏰`,
                message: message,
              },
              uc.user.emailConfig,
              uc.userId
            );
            console.log(`✓ Sent reminder email to ${uc.user.email}`);
          } catch (emailError) {
            console.error(`Failed to send reminder email to ${uc.user.email}:`, emailError.message);
          }
        }

        remindersSent++;
        console.log(`✓ Sent reminder to user ${uc.user.email} for challenge ${uc.challenge.name} (${pendingTasks.length} pending tasks)`);
      }
    }

    console.log(`✅ Daily reminders complete: ${remindersSent} reminders sent`);

    return res.status(200).json({
      success: true,
      remindersSent,
      hour: currentHour,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error in daily reminders:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
