import { ObjectId } from 'mongodb';
import { generateMotivationalMessage, generateChallengeRecommendations } from './gemini.js';
import { sendNotificationEmail } from './email.js';

/**
 * Notification System for nexLevel App
 */

/**
 * Send daily motivation notification to a user
 */
export async function sendDailyMotivation(db, userId) {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user?.settings?.notifications?.enabled || !user?.settings?.notifications?.types?.dailyReminder) {
      return null;
    }

    // Check quiet hours
    const now = new Date();
    const currentHour = now.getHours();
    const quietStart = parseInt(user.settings.notifications.quietHours.start.split(':')[0]);
    const quietEnd = parseInt(user.settings.notifications.quietHours.end.split(':')[0]);
    
    if (currentHour >= quietStart || currentHour < quietEnd) {
      console.log(`Skipping notification for ${user.email} - quiet hours`);
      return null;
    }

    // Get user's recent progress
    const userChallenges = await db.collection('userChallenges')
      .find({ userId: user._id, status: 'active' })
      .toArray();

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const checkIns = await db.collection('checkIns')
      .find({ userId: user._id, date: { $gte: weekAgo } })
      .toArray();

    const userData = {
      activeChallenges: userChallenges.length,
      checkInsThisWeek: checkIns.length,
      streaks: userChallenges.map(uc => uc.currentStreak)
    };

    const content = await generateMotivationalMessage(userData);

    // Create notification
    const notification = {
      userId: user._id,
      type: 'daily_motivation',
      title: '🌟 Daily Motivation',
      message: content.trim(),
      challengeId: null,
      read: false,
      createdAt: new Date()
    };

    const result = await db.collection('notifications').insertOne(notification);
    console.log(`✅ Daily motivation sent to ${user.email}`);
    
    // Send email notification if enabled
    if (user.settings?.notifications?.enabled && user.settings?.notifications?.types?.dailyReminder) {
      try {
        await sendNotificationEmail(user.email, user.displayName, notification);
      } catch (error) {
        console.error('Failed to send daily motivation email:', error.message);
      }
    }
    
    return { ...notification, _id: result.insertedId };
  } catch (error) {
    console.error('Error sending daily motivation:', error);
    return null;
  }
}

/**
 * Send friend progress notification
 */
export async function sendFriendProgressNotification(db, userId, friendId, challengeId) {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    const friend = await db.collection('users').findOne({ _id: new ObjectId(friendId) });
    const challenge = await db.collection('challenges').findOne({ _id: new ObjectId(challengeId) });

    if (!user?.settings?.notifications?.enabled || !user?.settings?.notifications?.types?.partnerComplete) {
      return null;
    }

    const notification = {
      userId: user._id,
      type: 'friend_progress',
      title: `${friend.displayName} completed a check-in! 🎉`,
      message: `Your friend just checked in for ${challenge.name}. Keep the momentum going!`,
      challengeId: new ObjectId(challengeId),
      friendId: friend._id,
      read: false,
      createdAt: new Date()
    };

    const result = await db.collection('notifications').insertOne(notification);
    console.log(`✅ Friend progress notification sent to ${user.email}`);
    
    // Send email notification if enabled
    if (user.settings?.notifications?.enabled && user.settings?.notifications?.types?.partnerComplete) {
      try {
        await sendNotificationEmail(user.email, user.displayName, notification);
      } catch (error) {
        console.error('Failed to send friend progress email:', error.message);
      }
    }
    
    return { ...notification, _id: result.insertedId };
  } catch (error) {
    console.error('Error sending friend progress notification:', error);
    return null;
  }
}

/**
 * Send friend suggestion notification based on similar challenges
 */
export async function sendFriendSuggestionNotification(db, userId) {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user?.settings?.notifications?.enabled) {
      return null;
    }

    // Get user's active challenges
    const userChallenges = await db.collection('userChallenges')
      .find({ userId: user._id, status: 'active' })
      .toArray();

    if (userChallenges.length === 0) {
      return null;
    }

    const challengeIds = userChallenges.map(uc => uc.challengeId);

    // Find other users doing the same challenges
    const potentialFriends = await db.collection('userChallenges')
      .aggregate([
        {
          $match: {
            challengeId: { $in: challengeIds },
            userId: { $ne: user._id },
            status: 'active'
          }
        },
        {
          $group: {
            _id: '$userId',
            commonChallenges: { $sum: 1 }
          }
        },
        {
          $match: {
            commonChallenges: { $gte: 1 }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $match: {
            '_id': { $nin: user.friendIds || [] }
          }
        },
        {
          $sort: { commonChallenges: -1 }
        },
        {
          $limit: 3
        }
      ])
      .toArray();

    if (potentialFriends.length === 0) {
      return null;
    }

    const suggestedFriend = potentialFriends[0].user;
    const commonCount = potentialFriends[0].commonChallenges;

    const notification = {
      userId: user._id,
      type: 'friend_suggestion',
      title: '👥 Friend Suggestion',
      message: `${suggestedFriend.displayName} is doing ${commonCount} of the same challenge${commonCount > 1 ? 's' : ''} as you! Connect to stay accountable together.`,
      challengeId: null,
      suggestedFriendId: suggestedFriend._id,
      read: false,
      createdAt: new Date()
    };

    const result = await db.collection('notifications').insertOne(notification);
    console.log(`✅ Friend suggestion sent to ${user.email}`);
    
    // Send email notification if enabled
    if (user.settings?.notifications?.enabled) {
      try {
        await sendNotificationEmail(user.email, user.displayName, notification);
      } catch (error) {
        console.error('Failed to send friend suggestion email:', error.message);
      }
    }
    
    return { ...notification, _id: result.insertedId };
  } catch (error) {
    console.error('Error sending friend suggestion:', error);
    return null;
  }
}

/**
 * Send challenge suggestion notification
 */
export async function sendChallengeSuggestionNotification(db, userId) {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user?.settings?.notifications?.enabled || !user?.settings?.ai?.recommendations) {
      return null;
    }

    // Get user's challenge history
    const userChallenges = await db.collection('userChallenges')
      .find({ userId: user._id })
      .toArray();

    const challengeIds = userChallenges.map(uc => uc.challengeId);

    const challenges = await db.collection('challenges')
      .find({ _id: { $in: challengeIds } })
      .toArray();

    const categories = challenges.map(c => c.category);
    const userData = {
      completedChallenges: userChallenges.filter(uc => uc.status === 'completed').length,
      categories: [...new Set(categories)],
      currentStreak: user.stats?.longestStreak || 0
    };

    // Generate AI recommendations
    const recommendations = await generateChallengeRecommendations(userData);

    // Find recommended challenges from database
    const popularChallenges = await db.collection('challenges')
      .find({ 
        isTemplate: true, 
        isPublic: true,
        _id: { $nin: challengeIds }
      })
      .sort({ 'stats.activeUsers': -1 })
      .limit(3)
      .toArray();

    if (popularChallenges.length === 0) {
      return null;
    }

    const suggestedChallenge = popularChallenges[0];

    const notification = {
      userId: user._id,
      type: 'challenge_suggestion',
      title: '💡 New Challenge Suggestion',
      message: `Based on your progress, you might enjoy: ${suggestedChallenge.name}. ${recommendations.substring(0, 100)}...`,
      challengeId: suggestedChallenge._id,
      read: false,
      createdAt: new Date()
    };

    const result = await db.collection('notifications').insertOne(notification);
    console.log(`✅ Challenge suggestion sent to ${user.email}`);
    
    // Send email notification if enabled
    if (user.settings?.notifications?.enabled && user.settings?.ai?.recommendations) {
      try {
        await sendNotificationEmail(user.email, user.displayName, notification);
      } catch (error) {
        console.error('Failed to send challenge suggestion email:', error.message);
      }
    }
    
    return { ...notification, _id: result.insertedId };
  } catch (error) {
    console.error('Error sending challenge suggestion:', error);
    return null;
  }
}

/**
 * Send streak milestone notification
 */
export async function sendStreakMilestoneNotification(db, userId, userChallengeId, streak) {
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    const userChallenge = await db.collection('userChallenges').findOne({ _id: new ObjectId(userChallengeId) });
    const challenge = await db.collection('challenges').findOne({ _id: userChallenge.challengeId });

    if (!user?.settings?.notifications?.enabled || !user?.settings?.notifications?.types?.streakMilestone) {
      return null;
    }

    // Only notify on milestone streaks (7, 14, 21, 30, 50, 75, 100, etc.)
    const milestones = [7, 14, 21, 30, 50, 75, 100, 200, 365];
    if (!milestones.includes(streak)) {
      return null;
    }

    const notification = {
      userId: user._id,
      type: 'streak_milestone',
      title: `🔥 ${streak}-Day Streak!`,
      message: `Congratulations! You've maintained a ${streak}-day streak for ${challenge.name}. Keep up the amazing work!`,
      challengeId: challenge._id,
      userChallengeId: userChallenge._id,
      streak,
      read: false,
      createdAt: new Date()
    };

    const result = await db.collection('notifications').insertOne(notification);
    console.log(`✅ Streak milestone notification sent to ${user.email}`);
    
    // Send email notification if enabled
    if (user.settings?.notifications?.enabled && user.settings?.notifications?.types?.streakMilestone) {
      try {
        await sendNotificationEmail(user.email, user.displayName, notification);
      } catch (error) {
        console.error('Failed to send streak milestone email:', error.message);
      }
    }
    
    return { ...notification, _id: result.insertedId };
  } catch (error) {
    console.error('Error sending streak milestone notification:', error);
    return null;
  }
}

/**
 * Batch send daily motivations to all users
 */
export async function sendDailyMotivationsToAll(db) {
  try {
    const users = await db.collection('users')
      .find({ 'settings.notifications.enabled': true })
      .toArray();

    console.log(`📧 Sending daily motivations to ${users.length} users...`);

    let successCount = 0;
    for (const user of users) {
      const result = await sendDailyMotivation(db, user._id);
      if (result) successCount++;
    }

    console.log(`✅ Sent ${successCount} daily motivations`);
    return successCount;
  } catch (error) {
    console.error('Error batch sending daily motivations:', error);
    return 0;
  }
}

export default {
  sendDailyMotivation,
  sendFriendProgressNotification,
  sendFriendSuggestionNotification,
  sendChallengeSuggestionNotification,
  sendStreakMilestoneNotification,
  sendDailyMotivationsToAll
};
