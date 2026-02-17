import { ObjectId } from 'mongodb';

/**
 * Query Resolvers for GraphQL API
 */
export const Query = {
  // ============================================================
  // AUTHENTICATION
  // ============================================================
  
  me: async (_, __, { user, db }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    return user;
  },

  // ============================================================
  // USERS
  // ============================================================
  
  user: async (_, { id }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    return await db.collection('users').findOne({ _id: new ObjectId(id) });
  },

  searchUsers: async (_, { query }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const searchRegex = new RegExp(query, 'i');
    
    return await db.collection('users')
      .find({
        $or: [
          { displayName: searchRegex },
          { email: searchRegex }
        ]
      })
      .limit(20)
      .toArray();
  },

  // ============================================================
  // CHALLENGES
  // ============================================================
  
  challenge: async (_, { id }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    return await db.collection('challenges').findOne({ _id: new ObjectId(id) });
  },

  challenges: async (_, { category, isTemplate, search, visibility, limit = 50, offset = 0 }, { db, user }) => {
    const filter = {};
    
    // Category filter
    if (category) filter.category = category;
    
    // Template filter
    if (isTemplate !== undefined) filter.isTemplate = isTemplate;
    
    // Search filter (name or description)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Visibility filter
    if (visibility === 'private' && user) {
      filter.isPublic = false;
      filter.$or = [
        { createdBy: user._id },
        { collaborators: user._id }
      ];
    } else if (visibility === 'public') {
      filter.isPublic = true;
    } else {
      // Default: show public challenges or user's own
      if (user) {
        filter.$or = [
          { isPublic: true },
          { createdBy: user._id }
        ];
      } else {
        filter.isPublic = true;
      }
    }
    
    return await db.collection('challenges')
      .find(filter)
      .sort({ 'stats.totalUsers': -1, createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  },

  popularChallenges: async (_, { limit = 10 }, { db }) => {
    // Public query - no authentication required
    console.log('🔍 popularChallenges query called with limit:', limit);
    
    // Fetch both template challenges AND user-created public challenges
    const filter = { isPublic: true };
    console.log('🔍 Filter:', JSON.stringify(filter));
    
    const results = await db.collection('challenges')
      .find(filter)
      .sort({ 
        isTemplate: -1, // Templates first
        'stats.activeUsers': -1, // Then by popularity
        createdAt: -1 // Then by newest
      })
      .limit(limit * 2) // Fetch more to account for duplicates
      .toArray();
    
    console.log('📊 Found challenges:', results.length);
    
    // Remove duplicates based on name, duration, frequency, and tasks
    const uniqueChallenges = [];
    const seenSignatures = new Set();
    
    for (const challenge of results) {
      // Create a signature for duplicate detection
      const taskSignature = (challenge.tasks || [])
        .map(t => `${t.title}:${t.description}`)
        .sort()
        .join('|');
      const signature = `${challenge.name.toLowerCase().trim()}:${challenge.duration}:${challenge.frequency}:${taskSignature}`;
      
      if (!seenSignatures.has(signature)) {
        seenSignatures.add(signature);
        uniqueChallenges.push(challenge);
      } else {
        console.log('🔍 Duplicate detected:', challenge.name);
      }
      
      // Stop when we have enough unique challenges
      if (uniqueChallenges.length >= limit) {
        break;
      }
    }
    
    console.log('📊 Unique challenges after deduplication:', uniqueChallenges.length);
    if (uniqueChallenges.length > 0) {
      console.log('📋 Sample challenge:', uniqueChallenges[0].name, '- isTemplate:', uniqueChallenges[0].isTemplate, ', isPublic:', uniqueChallenges[0].isPublic);
    }
    
    return uniqueChallenges;
  },

  // ============================================================
  // USER CHALLENGES
  // ============================================================
  
  userChallenge: async (_, { id }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    return await db.collection('userChallenges').findOne({ _id: new ObjectId(id) });
  },

  myActiveChallenges: async (_, __, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    return await db.collection('userChallenges')
      .find({ 
        userId: user._id,
        status: 'active'
      })
      .sort({ startDate: -1 })
      .toArray();
  },

  myCompletedChallenges: async (_, __, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    return await db.collection('userChallenges')
      .find({ 
        userId: user._id,
        status: 'completed'
      })
      .sort({ completedAt: -1 })
      .toArray();
  },

  // ============================================================
  // CHECK-INS
  // ============================================================
  
  checkIn: async (_, { id }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }
    
    return await db.collection('checkIns').findOne({ _id: new ObjectId(id) });
  },

  checkInsForChallenge: async (_, { userChallengeId, startDate, endDate }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const filter = { userChallengeId: new ObjectId(userChallengeId) };
    
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }
    
    return await db.collection('checkIns')
      .find(filter)
      .sort({ date: -1 })
      .toArray();
  },

  // ============================================================
  // AI MESSAGES
  // ============================================================
  
  aiMessages: async (_, { unreadOnly = false, limit = 50 }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const filter = { userId: user._id };
    if (unreadOnly) filter.read = false;
    
    return await db.collection('aiMessages')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  },

  aiInsights: async (_, __, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    return await db.collection('aiInsights').findOne({ userId: user._id });
  },

  aiRecommendations: async (_, __, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // This will be implemented in mutations
    // For now, return empty array
    return [];
  },

  // ============================================================
  // SOCIAL
  // ============================================================
  
  friends: async (_, __, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const friendIds = user.friendIds || [];
    
    if (friendIds.length === 0) {
      return [];
    }
    
    return await db.collection('users')
      .find({ _id: { $in: friendIds } })
      .toArray();
  },

  friendRequests: async (_, __, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const receivedIds = user.friendRequests?.received || [];
    
    if (receivedIds.length === 0) {
      return [];
    }
    
    return await db.collection('users')
      .find({ _id: { $in: receivedIds.map(id => new ObjectId(id)) } })
      .toArray();
  },

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  
  notifications: async (_, { unreadOnly = false, limit = 50 }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const filter = { userId: user._id };
    if (unreadOnly) filter.read = false;
    
    return await db.collection('notifications')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  },

  // ============================================================
  // POLLING / REALTIME UPDATES
  // ============================================================
  
  updates: async (_, { since }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const sinceDate = new Date(since);
    const friendIds = user.friendIds || [];

    // Get new check-ins from friends
    const newCheckIns = await db.collection('checkIns')
      .aggregate([
        {
          $match: {
            timestamp: { $gt: sinceDate },
            userId: { $in: friendIds }
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
            from: 'userChallenges',
            localField: 'userChallengeId',
            foreignField: '_id',
            as: 'userChallenge'
          }
        },
        {
          $lookup: {
            from: 'challenges',
            localField: 'userChallenge.challengeId',
            foreignField: '_id',
            as: 'challenge'
          }
        },
        { $limit: 20 },
        { $sort: { timestamp: -1 } }
      ])
      .toArray();

    // Get new AI messages
    const newMessages = await db.collection('aiMessages')
      .find({
        userId: user._id,
        createdAt: { $gt: sinceDate },
        read: false
      })
      .limit(10)
      .toArray();

    // Construct friend activity from check-ins
    const friendActivity = newCheckIns.map(ci => ({
      user: ci.user[0],
      action: 'completed_checkin',
      challenge: ci.challenge[0],
      timestamp: ci.timestamp
    }));

    return {
      newCheckIns: newCheckIns.map(ci => ({
        ...ci,
        user: ci.user[0],
        challenge: ci.challenge[0]
      })),
      newMessages,
      friendActivity,
      timestamp: new Date().toISOString()
    };
  },

  // Feature Requests
  featureRequests: async (_, { status, limit = 50 }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const filter = status ? { status } : {};

    return await db.collection('featureRequests')
      .find(filter)
      .sort({ votes: -1, createdAt: -1 })
      .limit(limit)
      .toArray();
  },

  // Admin Only Queries
  allUsers: async (_, { limit = 50, offset = 0 }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check if user is admin using role field
    const adminUser = await db.collection('users').findOne({ _id: user._id });
    if (adminUser?.role !== 'admin' && !adminUser?.isAdmin) {
      throw new Error('Admin access required');
    }

    return await db.collection('users')
      .find({})
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();
  },

  allFeedback: async (_, { status, limit = 50, offset = 0 }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check if user is admin using role field
    const adminUser = await db.collection('users').findOne({ _id: user._id });
    if (adminUser?.role !== 'admin' && !adminUser?.isAdmin) {
      throw new Error('Admin access required');
    }

    const filter = status ? { status } : {};
    const feedback = await db.collection('feedback')
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit)
      .toArray();

    return feedback;
  },

  systemStats: async (_, { limit, offset }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    // Check if user is admin using role field
    const adminUser = await db.collection('users').findOne({ _id: user._id });
    if (adminUser?.role !== 'admin' && !adminUser?.isAdmin) {
      throw new Error('Admin access required');
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalChallenges,
      totalCheckIns,
      activeUsers,
      activeChallenges
    ] = await Promise.all([
      db.collection('users').countDocuments(),
      db.collection('challenges').countDocuments(),
      db.collection('checkIns').countDocuments(),
      db.collection('users').countDocuments({ lastLoginAt: { $gte: thirtyDaysAgo } }),
      db.collection('userChallenges').countDocuments({ status: 'active' })
    ]);

    return {
      totalUsers,
      totalChallenges,
      totalCheckIns,
      activeUsers,
      activeChallenges
    };
  },

  // Leaderboards
  globalLeaderboard: async (_, { limit = 100 }, { db }) => {
    const users = await db.collection('users')
      .find({})
      .sort({ 'stats.longestStreak': -1, 'stats.totalCheckIns': -1 })
      .limit(limit)
      .toArray();

    return users.map((user, index) => ({
      user,
      totalCheckIns: user.stats.totalCheckIns,
      longestStreak: user.stats.longestStreak,
      activeChallenges: user.stats.activeChallenges,
      completionRate: user.stats.totalCheckIns > 0 ? 
        ((user.stats.totalCheckIns / (user.stats.totalChallenges * 30)) * 100) : 0,
      rank: index + 1
    }));
  },

  challengeLeaderboard: async (_, { challengeId, limit = 50 }, { db }) => {
    const userChallenges = await db.collection('userChallenges')
      .find({ challengeId: new ObjectId(challengeId), status: 'active' })
      .sort({ currentStreak: -1, totalCheckIns: -1 })
      .limit(limit)
      .toArray();

    const leaderboard = await Promise.all(
      userChallenges.map(async (uc, index) => {
        const user = await db.collection('users').findOne({ _id: uc.userId });
        return {
          user,
          totalCheckIns: uc.totalCheckIns,
          longestStreak: uc.longestStreak,
          activeChallenges: 1,
          completionRate: uc.completionRate,
          rank: index + 1
        };
      })
    );

    return leaderboard;
  },

  // Chat/Messaging Queries
  myMessages: async (_, { limit = 50 }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    return await db.collection('chatMessages')
      .find({
        $or: [
          { fromUserId: user._id },
          { toUserId: user._id }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();
  },

  chatWith: async (_, { userId, limit = 50 }, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    const otherUserId = new ObjectId(userId);

    return await db.collection('chatMessages')
      .find({
        $or: [
          { fromUserId: user._id, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: user._id }
        ]
      })
      .sort({ createdAt: 1 })
      .limit(limit)
      .toArray();
  },

  // Certificates Query
  myCertificates: async (_, __, { db, user }) => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    return await db.collection('certificates')
      .find({ userId: user._id })
      .sort({ achievementDate: -1 })
      .toArray();
  },
};

export default Query;
