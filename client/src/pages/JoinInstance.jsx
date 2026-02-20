import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import { Loader2, CheckCircle, Users, Target } from 'lucide-react';

const JOIN_USER_CHALLENGE_INSTANCE = gql`
  mutation JoinUserChallengeInstance($userChallengeId: ID!) {
    joinUserChallengeInstance(userChallengeId: $userChallengeId) {
      id
      challenge {
        id
        name
        description
      }
      partners {
        id
        displayName
      }
    }
  }
`;

const GET_USER_CHALLENGE_INFO = gql`
  query GetUserChallengeInfo($id: ID!) {
    userChallenge(id: $id) {
      id
      challenge {
        name
        description
      }
      user {
        displayName
      }
    }
  }
`;

const JoinInstance = () => {
  const { userChallengeId } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const { data: challengeInfo } = useQuery(GET_USER_CHALLENGE_INFO, {
    variables: { id: userChallengeId },
    skip: !userChallengeId
  });

  const [joinInstance, { loading }] = useMutation(JOIN_USER_CHALLENGE_INSTANCE, {
    variables: { userChallengeId },
    onCompleted: (data) => {
      setSuccess(true);
      // Redirect to challenges page after 2 seconds
      setTimeout(() => {
        navigate('/challenges');
      }, 2000);
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  useEffect(() => {
    if (userChallengeId) {
      joinInstance();
    }
  }, [userChallengeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <Loader2 className="w-16 h-16 mx-auto text-cyan-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Joining Challenge...
          </h2>
          {challengeInfo && (
            <div className="mt-4 text-left">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                <strong>{challengeInfo.userChallenge.user.displayName}</strong> invited you to:
              </p>
              <div className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-lg p-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
                  {challengeInfo.userChallenge.challenge.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {challengeInfo.userChallenge.challenge.description}
                </p>
              </div>
            </div>
          )}
          <p className="text-gray-600 dark:text-gray-400 mt-4">
            Creating your challenge instance and connecting you as streak partners...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Unable to Join
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/browse')}
            className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold py-3 rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all"
          >
            Browse Challenges
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Successfully Joined!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You're now streak partners and have been added as friends!
          </p>
          <div className="bg-gradient-to-r from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 text-cyan-700 dark:text-cyan-400">
              <Users className="w-5 h-5" />
              <span className="font-semibold">Streak Partners Connected</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to your challenges...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default JoinInstance;
