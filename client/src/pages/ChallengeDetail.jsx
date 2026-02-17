import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_MY_ACTIVE_CHALLENGES } from '../lib/graphql';
import { Flame, CheckCircle, Calendar, Users, TrendingUp, Target, ArrowLeft, Loader2 } from 'lucide-react';

const ChallengeDetail = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(GET_MY_ACTIVE_CHALLENGES, {
    fetchPolicy: 'cache-and-network',
  });

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
        <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Challenge</h3>
        <p className="text-red-700">{error.message}</p>
      </div>
    );
  }

  const userChallenge = data?.myActiveChallenges?.find(uc => uc.challenge.id === challengeId);

  if (!userChallenge) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">Challenge Not Found</h3>
        <p className="text-yellow-700">This challenge is not in your active challenges.</p>
        <button
          onClick={() => navigate('/challenges')}
          className="mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          Back to My Challenges
        </button>
      </div>
    );
  }

  const uc = userChallenge;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back
      </button>

      {/* Challenge Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-8 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{uc.challenge.name}</h1>
            <p className="text-cyan-100 mb-4">{uc.challenge.description}</p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                {uc.challenge.category}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                {uc.challenge.frequency}
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                {uc.challenge.duration} days
              </span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                {uc.challenge.challengeType || 'solo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-center mb-2">
            <Flame className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 text-center">{uc.currentStreak}</p>
          <p className="text-sm text-gray-600 text-center">Current Streak</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 text-center">{uc.totalCheckIns}</p>
          <p className="text-sm text-gray-600 text-center">Total Check-ins</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-center mb-2">
            <TrendingUp className="w-8 h-8 text-cyan-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 text-center">{Math.round(uc.completionRate)}%</p>
          <p className="text-sm text-gray-600 text-center">Completion Rate</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-center mb-2">
            <Calendar className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 text-center">{uc.longestStreak}</p>
          <p className="text-sm text-gray-600 text-center">Best Streak</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Bar */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Overall Progress</h2>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress</span>
              <span className="text-sm font-semibold text-gray-900">{Math.round(uc.completionRate)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-4 rounded-full transition-all"
                style={{ width: `${Math.min(uc.completionRate, 100)}%` }}
              />
            </div>
          </div>

          {/* Tasks Progress */}
          {uc.challenge.tasks && uc.challenge.tasks.length > 0 && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Tasks Progress</h2>
              <div className="space-y-3">
                {[...uc.challenge.tasks].sort((a, b) => a.order - b.order).map((task) => {
                  const taskProg = uc.taskProgress?.find(tp => tp.taskId === task.id);
                  const isCompleted = taskProg?.completed || false;
                  const completedCount = taskProg?.completedCount || 0;
                  
                  return (
                    <div key={task.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                      <CheckCircle className={`w-5 h-5 mt-0.5 ${isCompleted ? 'text-green-500' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className={`font-semibold ${isCompleted ? 'text-green-700' : 'text-gray-700'}`}>
                            {task.title}
                          </p>
                          <span className="text-sm text-gray-500">
                            {completedCount} {completedCount === 1 ? 'time' : 'times'}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Last Check-in */}
          {uc.lastCheckIn && (
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Last Check-in</h2>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {uc.lastCheckIn.task?.title || 'Check-in completed'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(uc.lastCheckIn.timestamp).toLocaleDateString()} at {new Date(uc.lastCheckIn.timestamp).toLocaleTimeString()}
                  </p>
                  {uc.lastCheckIn.note && (
                    <p className="text-sm text-gray-700 mt-2 p-3 bg-gray-50 rounded-lg">
                      "{uc.lastCheckIn.note}"
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participants */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Participants</h2>
              <span className="text-sm text-gray-500">
                {uc.challenge.stats?.activeUsers || 0} active
              </span>
            </div>
            
            {uc.partners && uc.partners.length > 0 ? (
              <div className="space-y-3">
                {uc.partners.map((partner) => (
                  <div key={partner.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {partner.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{partner.displayName}</p>
                      <p className="text-xs text-gray-500">Partner</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Solo challenge - no partners yet</p>
            )}
          </div>

          {/* Challenge Info */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Challenge Info</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Start Date</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(uc.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">End Date</span>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(uc.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Duration</span>
                <span className="text-sm font-semibold text-gray-900">
                  {uc.challenge.duration} days
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                  {uc.status}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/challenges')}
                className="w-full px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-colors font-semibold"
              >
                Go to My Challenges
              </button>
              <button
                onClick={() => navigate('/progress')}
                className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                View All Progress
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetail;
