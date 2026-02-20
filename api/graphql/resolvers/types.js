import { ObjectId } from 'mongodb';

/**
 * Type Resolvers for nested GraphQL fields
 * These resolve relationships between different types
 */
export const User = {
  id: (parent) => parent._id.toString(),
  
  settings: (parent) => parent.settings || {
    notifications: {
      enabled: true,
      quietHours: { start: '22:00', end: '07:00' },
      types: { partnerComplete: true, dailyReminder: true, streakMilestone: true }
    },
    ai: {
      coachEnabled: true,
      photoVerification: true,
      recommendations: true,
      weeklyReports: true
    }
  },
  
  friends: async (parent, _, { db }) => {
    const friendIds = parent.friendIds || [];
    if (friendIds.length === 0) return [];
    
    return await db.collection('users')
      .find({ _id: { $in: friendIds } })
      .toArray();
  },
  
  stats: (parent) => parent.stats || {
    totalChallenges: 0,
    activeChallenges: 0,
    completedChallenges: 0,
    totalCheckIns: 0,
    longestStreak: 0
  },
  
  activeChallenges: async (parent, _, { db }) => {
    return await db.collection('userChallenges')
      .find({ 
        userId: parent._id,
        status: 'active'
      })
      .toArray();
  },
  
  createdAt: (parent) => parent.createdAt?.toISOString() || new Date().toISOString()
};

export const Challenge = {
  id: (parent) => parent._id.toString(),
  
  createdBy: async (parent, _, { db }) => {
    if (!parent.createdBy) return null;
    return await db.collection('users').findOne({ _id: parent.createdBy });
  },
  
  tasks: (parent) => parent.tasks || [],
  
  collaborators: async (parent, _, { db }) => {
    if (!parent.collaborators || parent.collaborators.length === 0) return [];
    
    // Filter out any invalid IDs and convert to ObjectId
    const validIds = parent.collaborators
      .filter(id => id && ObjectId.isValid(id))
      .map(id => new ObjectId(id));
    
    if (validIds.length === 0) return [];
    
    return await db.collection('users')
      .find({ _id: { $in: validIds } })
      .toArray();
  },
  
  stats: (parent) => parent.stats || {
    totalUsers: 0,
    activeUsers: 0,
    completionRate: 0,
    avgSuccessRate: 0
  },
  
  createdAt: (parent) => parent.createdAt?.toISOString() || new Date().toISOString()
};

export const UserChallenge = {
  id: (parent) => parent._id.toString(),
  
  user: async (parent, _, { db }) => {
    return await db.collection('users').findOne({ _id: parent.userId });
  },
  
  challenge: async (parent, _, { db }) => {
    return await db.collection('challenges').findOne({ _id: parent.challengeId });
  },
  
  partners: async (parent, _, { db }) => {
    if (!parent.partnerIds || parent.partnerIds.length === 0) return [];
    
    return await db.collection('users')
      .find({ _id: { $in: parent.partnerIds } })
      .toArray();
  },
  
  // All participants in this specific challenge instance (same challengeId)
  allParticipants: async (parent, _, { db, user }) => {
    // Get all user challenges for the same base challenge that are active
    const allUserChallenges = await db.collection('userChallenges')
      .find({
        challengeId: parent.challengeId,
        status: 'active'
      })
      .toArray();
    
    // Get user details for each participant
    const participants = await Promise.all(
      allUserChallenges.map(async (uc) => {
        const participantUser = await db.collection('users').findOne({ _id: uc.userId });
        return {
          user: participantUser,
          currentStreak: uc.currentStreak,
          totalCheckIns: uc.totalCheckIns,
          completionRate: uc.completionRate,
          lastCheckInAt: uc.lastCheckInAt,
          isYou: user && uc.userId.equals(user._id)
        };
      })
    );
    
    // Sort: current user first, then by streak
    return participants.sort((a, b) => {
      if (a.isYou) return -1;
      if (b.isYou) return 1;
      return b.currentStreak - a.currentStreak;
    });
  },
  
  lastCheckIn: async (parent, _, { db }) => {
    if (!parent.lastCheckInAt) return null;
    
    return await db.collection('checkIns')
      .findOne(
        { userChallengeId: parent._id },
        { sort: { timestamp: -1 } }
      );
  },
  
  checkIns: async (parent, _, { db }) => {
    return await db.collection('checkIns')
      .find({ userChallengeId: parent._id })
      .sort({ date: -1 })
      .toArray();
  },
  
  taskProgress: async (parent, _, { db }) => {
    // Get the challenge to know which tasks exist
    const challenge = await db.collection('challenges').findOne({ _id: parent.challengeId });
    if (!challenge || !challenge.tasks || challenge.tasks.length === 0) return [];
    
    // Get all check-ins for this user challenge
    const checkIns = await db.collection('checkIns')
      .find({ userChallengeId: parent._id })
      .toArray();
    
    // Calculate progress for each task
    const taskProgress = challenge.tasks.map(task => {
      const taskCheckIns = checkIns.filter(ci => ci.taskId?.toString() === task.id?.toString());
      const lastCheckIn = taskCheckIns.length > 0 
        ? taskCheckIns.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
        : null;
      
      return {
        taskId: task.id,
        task: task,
        completed: taskCheckIns.length > 0,
        completedAt: lastCheckIn ? lastCheckIn.timestamp : null,
        completedCount: taskCheckIns.length
      };
    });
    
    return taskProgress;
  },
  
  friendsParticipating: async (parent, _, { db, user }) => {
    if (!user?.friendIds || user.friendIds.length === 0) return [];
    
    // Find friends who are also in this challenge
    const friendUserChallenges = await db.collection('userChallenges')
      .find({
        challengeId: parent.challengeId,
        userId: { $in: user.friendIds },
        status: 'active'
      })
      .toArray();
    
    const friendIds = friendUserChallenges.map(uc => uc.userId);
    if (friendIds.length === 0) return [];
    
    return await db.collection('users')
      .find({ _id: { $in: friendIds } })
      .toArray();
  },
  
  startDate: (parent) => parent.startDate?.toISOString() || new Date().toISOString(),
  endDate: (parent) => parent.endDate?.toISOString() || new Date().toISOString(),
  notificationTime: (parent) => parent.notificationTime || '07:00',
  reminderEnabled: (parent) => parent.reminderEnabled !== false
};

export const CheckIn = {
  id: (parent) => parent._id.toString(),
  date: (parent) => parent.date?.toISOString() || new Date().toISOString(),
  timestamp: (parent) => parent.timestamp?.toISOString() || new Date().toISOString(),
  isEdited: (parent) => parent.isEdited || false,
  task: async (parent, _, { db }) => {
    if (!parent.taskId) return null;
    
    // Get the challenge to find the task
    const challenge = await db.collection('challenges').findOne({ 
      _id: parent.challengeId 
    });
    
    if (!challenge || !challenge.tasks) return null;
    
    return challenge.tasks.find(t => t.id === parent.taskId) || null;
  }
};

export const AIMessage = {
  id: (parent) => parent._id.toString(),
  challengeId: (parent) => parent.challengeId?.toString() || null,
  createdAt: (parent) => parent.createdAt?.toISOString() || new Date().toISOString()
};

export const Notification = {
  id: (parent) => parent._id.toString(),
  challengeId: (parent) => parent.challengeId?.toString() || null,
  partnerId: (parent) => parent.partnerId?.toString() || null,
  createdAt: (parent) => parent.createdAt?.toISOString() || new Date().toISOString()
};

export const AIInsight = {
  patterns: (parent) => parent.patterns || {
    bestCheckInTime: '07:00',
    bestDays: [],
    weakDays: [],
    successfulCategories: [],
    avgStreakLength: 0,
    completionRate: 0
  },
  
  predictions: (parent) => parent.predictions || {
    recommendations: [],
    dropoutRisk: 'low',
    riskFactors: []
  },
  
  generatedAt: (parent) => parent.generatedAt?.toISOString() || new Date().toISOString(),
  confidence: (parent) => parent.confidence || 0.5
};

export const ChallengeRecommendation = {
  challenge: async (parent, _, { db }) => {
    if (parent.challenge) return parent.challenge;
    if (parent.challengeId) {
      return await db.collection('challenges').findOne({ _id: parent.challengeId });
    }
    return null;
  },
  score: (parent) => parent.score || 0,
  reason: (parent) => parent.reason || ''
};

export const TaskProgress = {
  taskId: (parent) => parent.taskId?.toString() || parent.task?.id?.toString(),
  task: (parent) => parent.task,
  completed: (parent) => parent.completed || false,
  completedAt: (parent) => parent.completedAt?.toISOString?.() || parent.completedAt || null,
  completedCount: (parent) => parent.completedCount || 0
};

export const UserChallengeParticipant = {
  user: (parent) => parent.user,
  currentStreak: (parent) => parent.currentStreak,
  totalCheckIns: (parent) => parent.totalCheckIns,
  completionRate: (parent) => parent.completionRate,
  lastCheckInAt: (parent) => parent.lastCheckInAt?.toISOString?.() || parent.lastCheckInAt || null,
  isYou: (parent) => parent.isYou || false
};

export const FeatureRequest = {
  id: (parent) => parent._id?.toString() || parent.id,
  user: async (parent, _, { db }) => {
    if (!parent.userId) return null;
    return await db.collection('users').findOne({ _id: parent.userId });
  },
  createdAt: (parent) => parent.createdAt?.toISOString() || new Date().toISOString(),
  updatedAt: (parent) => parent.updatedAt?.toISOString() || new Date().toISOString()
};

export const FriendActivity = {
  id: (parent) => parent.id || parent._id?.toString() || `activity_${Date.now()}`,
  user: (parent) => parent.user,
  action: (parent) => parent.action || 'completed_checkin',
  challenge: (parent) => parent.challenge || null,
  message: (parent) => parent.message || '',
  timestamp: (parent) => parent.timestamp?.toISOString?.() || parent.timestamp || new Date().toISOString()
};

export default {
  User,
  Challenge,
  UserChallenge,
  CheckIn,
  AIMessage,
  Notification,
  AIInsight,
  ChallengeRecommendation,
  TaskProgress,
  UserChallengeParticipant,
  FeatureRequest,
  FriendActivity
};
