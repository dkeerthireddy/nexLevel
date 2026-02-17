import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { JOIN_CHALLENGE, GET_FRIENDS, GET_MY_ACTIVE_CHALLENGES } from '../../lib/graphql';
import { X, Users, Loader2, UserPlus, Target } from 'lucide-react';

const JoinChallengeModal = ({ challenge, onClose }) => {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [joining, setJoining] = useState(false);

  const { data: friendsData, loading: friendsLoading } = useQuery(GET_FRIENDS);
  const friends = friendsData?.friends || [];

  const [joinChallenge] = useMutation(JOIN_CHALLENGE, {
    onCompleted: () => {
      setJoining(false);
      alert('Successfully joined the challenge!');
      onClose();
    },
    onError: (error) => {
      setJoining(false);
      alert('Failed to join challenge: ' + error.message);
    },
    refetchQueries: [{ query: GET_MY_ACTIVE_CHALLENGES }]
  });

  const handleJoin = async () => {
    setJoining(true);
    await joinChallenge({
      variables: {
        challengeId: challenge.id,
        partnerIds: selectedFriends
      }
    });
  };

  const toggleFriend = (friendId) => {
    setSelectedFriends(prev =>
      prev.includes(friendId)
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Join Challenge</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Challenge Preview */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.name}</h3>
                <p className="text-gray-700 text-sm mb-3">{challenge.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-indigo-700">
                    {challenge.duration} days
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-purple-700 capitalize">
                    {challenge.frequency}
                  </span>
                  {challenge.tasks && challenge.tasks.length > 0 && (
                    <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-green-700">
                      {challenge.tasks.length} tasks
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tasks Preview */}
            {challenge.tasks && challenge.tasks.length > 0 && (
              <div className="mt-4 p-4 bg-white rounded-lg">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 uppercase">Daily Tasks</h4>
                <ul className="space-y-1">
                  {challenge.tasks.map((task) => (
                    <li key={task.id} className="flex items-start text-sm text-gray-700">
                      <span className="text-indigo-600 mr-2">•</span>
                      <span className="flex-1">{task.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Invite Friends Section */}
          <div>
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-gray-700 mr-2" />
              <h3 className="text-lg font-bold text-gray-900">Invite Streak Partners</h3>
              <span className="ml-auto text-sm text-gray-500">
                {selectedFriends.length} selected
              </span>
            </div>

            {friendsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No friends yet. Add friends to invite them!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {friends.map((friend) => (
                  <label
                    key={friend.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedFriends.includes(friend.id)
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend.id)}
                      onChange={() => toggleFriend(friend.id)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 mr-3"
                    />
                    <div className="flex items-center flex-1">
                      {friend.profilePhoto ? (
                        <img
                          src={friend.profilePhoto}
                          alt={friend.displayName}
                          className="w-10 h-10 rounded-full mr-3"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mr-3">
                          <span className="text-white font-semibold text-sm">
                            {friend.displayName?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{friend.displayName}</p>
                        <p className="text-xs text-gray-500">
                          {friend.stats?.activeChallenges || 0} active challenges
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}

            <p className="text-sm text-gray-500 mt-3">
              💡 Tip: Invited friends will be notified and can join as streak partners
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={joining}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center space-x-2"
          >
            {joining ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Joining...</span>
              </>
            ) : (
              <>
                <Target className="w-5 h-5" />
                <span>Join Challenge</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinChallengeModal;
