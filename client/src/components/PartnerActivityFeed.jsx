import { useQuery } from '@apollo/client';
import { GET_MY_ACTIVE_CHALLENGES, GET_NOTIFICATIONS } from '../lib/graphql';
import { CheckCircle, Clock, Trophy, User, Flame, Bell, TrendingUp, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Enhanced Partner Activity Feed Component
 * Shows real-time partner activity with notifications and social motivation
 */
const PartnerActivityFeed = () => {
  const { user } = useAuth();
  const [newActivities, setNewActivities] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  const { data, loading } = useQuery(GET_MY_ACTIVE_CHALLENGES, {
    pollInterval: 10000, // Refresh every 10 seconds for real-time feel
    skip: !user, // Only run if user is authenticated
    fetchPolicy: 'cache-and-network',
  });

  const { data: notificationsData } = useQuery(GET_NOTIFICATIONS, {
    variables: { unreadOnly: false, limit: 20 },
    pollInterval: 10000,
    skip: !user, // Only run if user is authenticated
    fetchPolicy: 'cache-and-network',
  });

  const activeChallenges = data?.myActiveChallenges || [];
  const notifications = notificationsData?.notifications || [];
  
  // Collect all partner activities from challenges and notifications
  const activities = [];
  
  // Add activities from partner check-ins
  activeChallenges.forEach(uc => {
    uc.partners?.forEach(partner => {
      // Get partner's last check-in for this challenge
      if (uc.lastCheckIn && uc.lastCheckIn.userId !== uc.userId) {
        activities.push({
          id: `${uc.id}-${partner.id}`,
          partner,
          challenge: uc.challenge,
          action: 'completed task',
          task: uc.lastCheckIn.task,
          timestamp: new Date(uc.lastCheckIn.timestamp),
          streak: uc.currentStreak,
          type: 'check-in',
          isNew: false,
        });
      }
    });
  });

  // Add activities from notifications (partner completions, milestones)
  notifications
    .filter(n => n.type === 'partner_complete' || n.type === 'streak_milestone')
    .forEach(notification => {
      const relatedChallenge = activeChallenges.find(uc => uc.challenge.id === notification.challengeId);
      const partner = relatedChallenge?.partners.find(p => p.id === notification.partnerId);
      
      if (partner && relatedChallenge) {
        activities.push({
          id: notification.id,
          partner,
          challenge: relatedChallenge.challenge,
          action: notification.type === 'streak_milestone' ? 'reached milestone' : 'completed task',
          message: notification.message,
          timestamp: new Date(notification.createdAt),
          streak: relatedChallenge.currentStreak,
          type: notification.type,
          isNew: !notification.read,
        });
      }
    });

  // Sort by most recent
  activities.sort((a, b) => b.timestamp - a.timestamp);
  
  const recentActivities = activities.slice(0, 10);

  // Request notification permission - run once on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Detect new activities - use stringified activities to avoid dependency issues
  useEffect(() => {
    const currentNew = activities.filter(a => a.isNew);
    
    if (currentNew.length > 0 && currentNew.length > newActivities.length) {
      setShowNotification(true);
      setNewActivities(currentNew);
      
      // Show browser notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Partner Activity!', {
          body: `${currentNew[0]?.partner.displayName} just checked in!`,
          icon: currentNew[0]?.partner.profilePhoto || '/icon.png',
          badge: '/icon.png',
        });
      }
      
      // Auto-hide notification banner after 5 seconds
      setTimeout(() => setShowNotification(false), 5000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, notificationsData]); // Only depend on query data, not derived activities

  if (loading) {
    return (
      <div className="bg-white dark:bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-border">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <User className="w-5 h-5 mr-2 text-purple-600" />
          Partner Activity
        </h3>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex items-start space-x-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (recentActivities.length === 0) {
    return (
      <div className="bg-white dark:bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-border">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-900 dark:text-gray-100">
          <User className="w-5 h-5 mr-2 text-purple-600" />
          Partner Activity
        </h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            No recent partner activity yet.<br/>
            Invite friends to join your challenges!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header with notification badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center text-gray-900 dark:text-gray-100">
          <User className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
          Partner Activity
        </h3>
        {newActivities.length > 0 && (
          <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-pink-500 to-orange-500 dark:from-pink-600 dark:to-orange-600 text-white text-xs font-bold rounded-full animate-pulse">
            {newActivities.length} new
          </span>
        )}
      </div>

      {/* Real-time notification banner */}
      {showNotification && newActivities.length > 0 && (
        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-l-4 border-green-500 dark:border-green-600 rounded-lg animate-slideIn">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-green-600 dark:text-green-400 animate-bounce" />
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              🎉 {newActivities[0].partner.displayName} just completed a task!
            </p>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {recentActivities.map((activity) => (
          <div 
            key={activity.id} 
            className={`relative flex items-start space-x-3 p-3 rounded-lg transition-all ${
              activity.isNew 
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-l-2 border-purple-500 dark:border-purple-400 animate-fadeIn' 
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            {/* New badge */}
            {activity.isNew && (
              <span className="absolute top-2 right-2 px-1.5 py-0.5 bg-purple-600 dark:bg-purple-500 text-white text-xs font-bold rounded-full">
                NEW
              </span>
            )}

            {/* Avatar with online indicator */}
            <div className="flex-shrink-0 relative">
              {activity.partner.profilePhoto ? (
                <img 
                  src={activity.partner.profilePhoto} 
                  alt={activity.partner.displayName}
                  className="w-10 h-10 rounded-full ring-2 ring-green-400 dark:ring-green-500"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600 flex items-center justify-center text-white font-semibold ring-2 ring-green-400 dark:ring-green-500">
                  {activity.partner.displayName[0].toUpperCase()}
                </div>
              )}
              {/* Online indicator */}
              {activity.isNew && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></span>
              )}
            </div>

            {/* Activity Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 dark:text-gray-100">
                <span className="font-semibold">{activity.partner.displayName}</span>
                {' '}{activity.action}{' '}
                {activity.task && (
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    {activity.task.title}
                  </span>
                )}
                {activity.type === 'streak_milestone' && (
                  <span className="inline-flex items-center ml-1">
                    <Trophy className="w-4 h-4 text-yellow-500 dark:text-yellow-400" />
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activity.challenge.name} • {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
              </p>
              
              {/* Streak Badge */}
              {activity.streak > 3 && (
                <div className="mt-2 inline-flex items-center space-x-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-xs font-medium">
                  <Flame className="w-3 h-3" />
                  <span>{activity.streak} day streak! 🔥</span>
                </div>
              )}

              {/* Social motivation message */}
              {activity.isNew && (
                <div className="mt-2 flex items-center space-x-2">
                  <button className="inline-flex items-center space-x-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 hover:bg-pink-200 dark:hover:bg-pink-900/50 text-pink-700 dark:text-pink-400 rounded-full text-xs font-medium transition-colors">
                    <Heart className="w-3 h-3" />
                    <span>Cheer</span>
                  </button>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">
                    💪 Stay motivated together!
                  </p>
                </div>
              )}
            </div>

            {/* Icon */}
            <div className="flex-shrink-0">
              {activity.type === 'streak_milestone' ? (
                <Trophy className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* View All Link & Stats */}
      {activities.length > 10 && (
        <button className="w-full mt-4 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium transition-colors">
          View all {activities.length} activities →
        </button>
      )}

      {/* Social motivation summary */}
      {recentActivities.length > 0 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
                Your partners are crushing it!
              </p>
            </div>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              {recentActivities.length} active
            </span>
          </div>
          <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
            Keep the momentum going - check in today! 🚀
          </p>
        </div>
      )}
    </div>
  );
};

export default PartnerActivityFeed;
