import { ObjectId } from 'mongodb';
import { sendNotificationEmail } from './email.js';

/**
 * Send email notification to friends when a partner completes a task
 */
export async function sendTaskCompletionNotificationToFriends(db, userId, userChallengeId, taskId, taskTitle, challengeName) {
  try {
    const userChallenge = await db.collection('userChallenges').findOne({
      _id: new ObjectId(userChallengeId)
    });

    if (!userChallenge || !userChallenge.partnerIds || userChallenge.partnerIds.length === 0) {
      return; // No partners to notify
    }

    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      console.error('User not found for task completion notification');
      return;
    }

    // Get all friends who are partners in this challenge
    for (const partnerId of userChallenge.partnerIds) {
      const partner = await db.collection('users').findOne({ _id: partnerId });
      
      if (!partner) {
        continue;
      }

      // Check if partner has notifications enabled
      if (!partner.settings?.notifications?.enabled || 
          !partner.settings?.notifications?.types?.partnerComplete) {

        continue;
      }

      // Create notification object
      const notification = {
        userId: partnerId,
        type: 'partner_completed',
        title: `${user.displayName} completed a task! 🎉`,
        message: `Your partner just completed "${taskTitle}" in ${challengeName}`,
        challengeId: userChallenge.challengeId,
        partnerId: userId,
        taskId: taskId,
        read: false,
        createdAt: new Date()
      };

      // Save notification to database
      await db.collection('notifications').insertOne(notification);

      // Send email notification using admin email
      try {
        await sendNotificationEmail(
          partner.email,
          partner.displayName,
          notification
        );
        console.log(`✅ Task completion email sent to ${partner.displayName} (${partner.email})`);
      } catch (emailError) {
        console.error(`Failed to send task completion email to ${partner.email}:`, emailError.message);
      }
    }
  } catch (error) {
    console.error('Error sending task completion notifications:', error);
  }
}

/**
 * Send reminder emails to friends about pending tasks
 */
export async function sendTaskReminderToFriends(db, userId, userChallengeId, pendingTasks, challengeName) {
  try {
    const userChallenge = await db.collection('userChallenges').findOne({
      _id: new ObjectId(userChallengeId)
    });

    if (!userChallenge || !userChallenge.partnerIds || userChallenge.partnerIds.length === 0) {
      return;
    }

    const user = await db.collection('users').findOne({ _id: userId });
    if (!user) {
      console.error('User not found for task reminder notification');
      return;
    }

    for (const partnerId of userChallenge.partnerIds) {
      const partner = await db.collection('users').findOne({ _id: partnerId });
      
      if (!partner) {
        continue;
      }

      // Check if partner has reminder notifications enabled
      if (!partner.settings?.notifications?.enabled || 
          !partner.settings?.notifications?.types?.dailyReminder) {
        continue;
      }

      // Create reminder notification
      const taskList = pendingTasks.map(t => `• ${t.title}`).join('\n');
      const notification = {
        userId: partnerId,
        type: 'challenge_reminder',
        title: `Reminder: Pending tasks in ${challengeName}`,
        message: `Your partner ${user.displayName} has pending tasks:\n${taskList}`,
        challengeId: userChallenge.challengeId,
        partnerId: userId,
        read: false,
        createdAt: new Date()
      };

      await db.collection('notifications').insertOne(notification);

      // Send email notification using admin email
      try {
        await sendNotificationEmail(
          partner.email,
          partner.displayName,
          notification
        );

      } catch (emailError) {
        console.error(`Failed to send task reminder email to ${partner.email}:`, emailError.message);
      }
    }
  } catch (error) {
    console.error('Error sending task reminder notifications:', error);
  }
}

export default {
  sendTaskCompletionNotificationToFriends,
  sendTaskReminderToFriends
};
