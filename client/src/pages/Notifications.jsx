import { useQuery, useMutation } from '@apollo/client';
import { GET_NOTIFICATIONS, MARK_NOTIFICATION_READ } from '../lib/graphql';
import { Bell, BellOff, CheckCircle, Users, TrendingUp, Gift, Flame, Mail } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Notifications = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const { data, loading, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { 
      unreadOnly: filter === 'unread',
      limit: 50 
    },
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ, {
    onCompleted: () => {
      refetch();
    }
  });

  const handleMarkRead = (id) => {
    markRead({ variables: { id } });
  };

  const notifications = data?.notifications || [];

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'partner_completed':
      case 'partner_checkin':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'friend_progress':
        return <TrendingUp className="w-5 h-5 text-blue-500" />;
      case 'streak_milestone':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'challenge_invitation':
        return <Mail className="w-5 h-5 text-cyan-500" />;
      case 'challenge_exit':
        return <BellOff className="w-5 h-5 text-red-500" />;
      case 'friend_suggestion':
        return <Users className="w-5 h-5 text-indigo-500" />;
      case 'challenge_suggestion':
        return <Gift className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Unread
          </button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">
            {filter === 'unread' ? "You're all caught up!" : 'Notifications will appear here'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`bg-white rounded-xl p-5 border transition-all ${
                notification.read
                  ? 'border-gray-200'
                  : 'border-indigo-300 bg-indigo-50'
              }`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4">
                        <p className="text-xs text-gray-500">
                          {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                          {new Date(notification.createdAt).toLocaleTimeString()}
                        </p>
                        <span className="inline-flex items-center text-xs text-green-600">
                          <Mail className="w-3 h-3 mr-1" />
                          Email sent
                        </span>
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkRead(notification.id)}
                        className="ml-4 px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
