import { useQuery } from '@apollo/client';
import { GET_POPULAR_CHALLENGES } from '../lib/graphql';
import { Target, Users, TrendingUp, Loader2, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import JoinChallengeModal from '../components/challenges/JoinChallengeModal';
import { useAuth } from '../contexts/AuthContext';

const Browse = () => {
  const { user } = useAuth();
  const { data, loading, error } = useQuery(GET_POPULAR_CHALLENGES, {
    variables: { limit: 20 },
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  // Debug logging
  console.log('Browse page - loading:', loading, 'error:', error, 'data:', data);

  const popularChallenges = data?.popularChallenges || [];

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
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Challenges</h3>
        <p className="text-red-700">{error.message}</p>
        <p className="text-sm text-red-600 mt-2">Check browser console for details</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2 sm:mb-3">Browse Challenges</h1>
        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">Discover popular challenges and start building better habits</p>
      </div>

      {popularChallenges.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
          <Target className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No challenges available</h3>
          <p className="text-gray-600 dark:text-gray-400">Check back later for new challenges!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {popularChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg border-2 border-cyan-100 dark:border-cyan-900/30 hover:shadow-xl transform hover:scale-105 transition-all"
            >
              {/* Category Badge */}
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 text-cyan-700 dark:text-cyan-300 text-xs rounded-full font-semibold capitalize">
                  {challenge.category}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{challenge.duration} days</span>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{challenge.name}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">{challenge.description}</p>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Target className="w-4 h-4 mr-2" />
                  <span className="capitalize">{challenge.frequency} commitment</span>
                </div>
                {challenge.tasks && challenge.tasks.length > 0 && (
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>{challenge.tasks.length} daily tasks</span>
                  </div>
                )}
                {challenge.requirePhotoProof && (
                  <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    <span>Photo verification required</span>
                  </div>
                )}
              </div>

              {/* Task List */}
              {challenge.tasks && challenge.tasks.length > 0 && (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase">Daily Tasks</h4>
                  <ul className="space-y-1">
                    {challenge.tasks.slice(0, 3).map((task, idx) => (
                      <li key={task.id} className="flex items-start text-sm text-gray-600 dark:text-gray-400">
                        <span className="text-cyan-600 dark:text-indigo-400 mr-2">•</span>
                        <span className="flex-1">{task.title}</span>
                      </li>
                    ))}
                    {challenge.tasks.length > 3 && (
                      <li className="text-xs text-gray-500 dark:text-gray-400 italic ml-4">
                        +{challenge.tasks.length - 3} more tasks
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{challenge.stats.activeUsers}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Active Users</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    {Math.round(challenge.stats.completionRate)}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Success Rate</p>
                </div>
              </div>

              {/* Join Button */}
              <button
                onClick={() => setSelectedChallenge(challenge)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-cyan-600 dark:to-blue-700 text-white font-semibold py-3 rounded-xl hover:shadow-xl transform hover:scale-105 transition-all flex items-center justify-center space-x-2 shadow-lg"
              >
                <Target className="w-5 h-5" />
                <span>Join Challenge</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Join Challenge Modal */}
      {selectedChallenge && (
        <JoinChallengeModal
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
        />
      )}
    </div>
  );
};

export default Browse;
