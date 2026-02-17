import { useQuery, useMutation } from '@apollo/client';
import { useAuth } from '../contexts/AuthContext';
import { GET_MY_ACTIVE_CHALLENGES, GET_AI_MESSAGES, GENERATE_AI_COACH_MESSAGE } from '../lib/graphql';
import { Target, TrendingUp, Flame, Calendar, Sparkles, Loader2, Mail, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PartnerActivityFeed from '../components/PartnerActivityFeed';
import OnboardingTour from '../components/OnboardingTour';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [generatingAI, setGeneratingAI] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { data: challengesData, loading: challengesLoading } = useQuery(GET_MY_ACTIVE_CHALLENGES, {
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });
  const { data: messagesData, refetch: refetchMessages } = useQuery(GET_AI_MESSAGES, {
    variables: { unreadOnly: false, limit: 5 },
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const [generateAIMessage] = useMutation(GENERATE_AI_COACH_MESSAGE, {
    onCompleted: () => {
      refetchMessages();
      setGeneratingAI(false);
    },
    onError: (error) => {
      console.error('AI generation error:', error);
      setGeneratingAI(false);
    }
  });

  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    await generateAIMessage();
  };

  const activeChallenges = challengesData?.myActiveChallenges || [];
  const aiMessages = messagesData?.aiMessages || [];

  return (
    <>
      <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      
      <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
        {/* Email Verification Banner */}
      {user && !user.emailVerified && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 rounded-lg">
          <div className="flex items-start">
            <Mail className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                Verify your email address
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Please verify your email to unlock all features. Check your inbox for the verification code.
              </p>
              <Link 
                to="/verify-email-code"
                className="inline-block mt-2 text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:text-yellow-900 dark:hover:text-yellow-100 underline"
              >
                Verify now →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Active Challenges */}
      <div>
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Active Challenges</h2>
          <Link to="/challenges" className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold flex items-center space-x-1 transform hover:scale-105 transition-all text-sm sm:text-base">
            <span>View all</span>
            <span>→</span>
          </Link>
        </div>

        {challengesLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-600 dark:text-indigo-400" />
          </div>
        ) : activeChallenges.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 sm:p-12 text-center border border-gray-200 dark:border-gray-700">
            <Target className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No active challenges</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start your streak journey by joining a challenge!</p>
            <Link
              to="/browse"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 shadow-lg font-semibold"
            >
              <Target className="w-5 h-5 mr-2" />
              Browse Challenges
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {activeChallenges.slice(0, 6).map((uc) => (
              <div
                key={uc.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:border-brand-primary/30 dark:hover:border-brand-primary hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/challenge/${uc.challenge.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-2 group-hover:text-brand-primary dark:group-hover:text-brand-primary-light transition-colors">
                      {uc.challenge.name}
                    </h3>
                    <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-brand-primary dark:text-brand-primary-light text-xs rounded-full font-semibold">
                      {uc.challenge.category}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
                    <span className="flex items-center text-orange-600 dark:text-orange-400 font-semibold">
                      <Flame className="w-4 h-4 mr-1" />
                      {uc.currentStreak} days
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Completion</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {Math.round(uc.completionRate)}%
                    </span>
                  </div>

                  {/* Participants Display */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Participants</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {uc.partners && uc.partners.length > 0 ? (
                        <>
                          <div className="flex -space-x-2">
                            {uc.partners.slice(0, 3).map((partner) => (
                              <div
                                key={partner.id}
                                className="w-6 h-6 rounded-full bg-indigo-600 border-2 border-white dark:border-gray-800 flex items-center justify-center"
                                title={partner.displayName}
                              >
                                <span className="text-white text-xs font-semibold">
                                  {partner.displayName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                            ))}
                            {uc.partners.length > 3 && (
                              <div
                                className="w-6 h-6 rounded-full bg-gray-400 border-2 border-white dark:border-gray-800 flex items-center justify-center"
                                title={`+${uc.partners.length - 3} more`}
                              >
                                <span className="text-white text-xs font-semibold">
                                  +{uc.partners.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {uc.challenge.stats?.activeUsers || 0} active
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-500 dark:text-gray-400">Solo</span>
                      )}
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-primary h-2.5 rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${Math.min(uc.completionRate, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Coach Messages */}
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-brand-accent animate-pulse" />
            AI Coach
          </h2>
          <button
            onClick={handleGenerateAI}
            disabled={generatingAI}
            className="px-6 py-3 bg-brand-accent hover:bg-brand-accent-dark text-white rounded-xl hover:shadow-brand transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg font-semibold"
          >
            {generatingAI ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Get Motivation</span>
              </>
            )}
          </button>
        </div>

        <div className="space-y-4">
          {aiMessages.length === 0 ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-10 text-center border border-blue-200 dark:border-blue-800/50 shadow-lg">
              <div className="relative inline-block mb-4">
                <Sparkles className="w-16 h-16 text-brand-accent mx-auto animate-pulse" />
                <div className="absolute inset-0 w-16 h-16 bg-brand-accent rounded-full blur-xl opacity-30 animate-pulse"></div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">Click "Get Motivation" to receive personalized AI coaching!</p>
            </div>
          ) : (
            aiMessages.map((message) => (
              <div
                key={message.id}
                className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl hover:border-brand-accent/30 dark:hover:border-brand-accent transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-accent flex items-center justify-center flex-shrink-0 shadow-md">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{message.content}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 font-medium">
                      {new Date(message.createdAt).toLocaleDateString()} at{' '}
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        </div>

        {/* Partner Activity Feed - Takes 1 column */}
        <div className="lg:col-span-1">
          <PartnerActivityFeed />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
