import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@apollo/client';
import { GET_MY_ACTIVE_CHALLENGES } from '../lib/graphql';
import { TrendingUp, Flame, Calendar, Award, Target, Loader2 } from 'lucide-react';

const Progress = () => {
  const { user } = useAuth();
  const { data, loading, error } = useQuery(GET_MY_ACTIVE_CHALLENGES, {
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const activeChallenges = data?.myActiveChallenges || [];

  // Calculate overall stats
  const totalStreak = activeChallenges.reduce((sum, uc) => sum + uc.currentStreak, 0);
  const avgCompletion = activeChallenges.length > 0
    ? activeChallenges.reduce((sum, uc) => sum + uc.completionRate, 0) / activeChallenges.length
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Progress</h3>
        <p className="text-red-700">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Progress</h1>
        <p className="text-gray-600">Track your streak journey and celebrate your wins</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl p-6 text-white">
          <Target className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold mb-1">{user?.stats?.totalChallenges || 0}</p>
          <p className="text-indigo-100 text-sm">Total Challenges</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-xl p-6 text-white">
          <Flame className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold mb-1">{user?.stats?.longestStreak || 0}</p>
          <p className="text-orange-100 text-sm">Longest Streak</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <Calendar className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold mb-1">{user?.stats?.totalCheckIns || 0}</p>
          <p className="text-green-100 text-sm">Total Check-ins</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
          <Award className="w-8 h-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold mb-1">{user?.stats?.completedChallenges || 0}</p>
          <p className="text-cyan-100 text-sm">Completed</p>
        </div>
      </div>

      {/* Current Challenges Progress */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Challenges Progress</h2>
        
        {activeChallenges.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No active challenges</h3>
            <p className="text-gray-600">Join a challenge to start tracking your progress!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeChallenges.map((uc) => (
              <div
                key={uc.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {uc.challenge.name}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                      {uc.challenge.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-orange-600 font-semibold mb-1">
                      <Flame className="w-5 h-5 mr-1" />
                      {uc.currentStreak} days
                    </div>
                    <p className="text-xs text-gray-500">Current Streak</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{uc.totalCheckIns}</p>
                    <p className="text-xs text-gray-600">Check-ins</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{uc.longestStreak}</p>
                    <p className="text-xs text-gray-600">Best Streak</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{uc.missedDays}</p>
                    <p className="text-xs text-gray-600">Missed</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-2xl font-bold text-gray-900">{Math.round(uc.completionRate)}%</p>
                    <p className="text-xs text-gray-600">Complete</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.round(uc.completionRate)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${Math.min(uc.completionRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {user?.stats?.longestStreak >= 7 && (
            <div className="bg-white rounded-xl p-4 text-center border border-yellow-200 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-2 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="font-semibold text-gray-900">Week Warrior</p>
              <p className="text-xs text-gray-600">7-day streak</p>
            </div>
          )}
          {user?.stats?.totalCheckIns >= 30 && (
            <div className="bg-white rounded-xl p-4 text-center border border-green-200 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-gray-900">Consistency King</p>
              <p className="text-xs text-gray-600">30+ check-ins</p>
            </div>
          )}
          {user?.stats?.completedChallenges >= 1 && (
            <div className="bg-white rounded-xl p-4 text-center border border-cyan-200 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-2 bg-cyan-100 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-cyan-600" />
              </div>
              <p className="font-semibold text-gray-900">Goal Achiever</p>
              <p className="text-xs text-gray-600">1+ completed</p>
            </div>
          )}
          {user?.stats?.longestStreak >= 30 && (
            <div className="bg-white rounded-xl p-4 text-center border border-orange-200 shadow-sm">
              <div className="w-12 h-12 mx-auto mb-2 bg-orange-100 rounded-full flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <p className="font-semibold text-gray-900">Streak Master</p>
              <p className="text-xs text-gray-600">30-day streak</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Progress;
