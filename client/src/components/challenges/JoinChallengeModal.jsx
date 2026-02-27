import { useState } from 'react';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { JOIN_CHALLENGE, GET_FRIENDS, GET_MY_ACTIVE_CHALLENGES, SEARCH_USERS, SEND_FRIEND_REQUEST, INVITE_EMAIL_TO_CHALLENGE } from '../../lib/graphql';
import { X, Users, Loader2, UserPlus, Target, Search, Mail } from 'lucide-react';

const JoinChallengeModal = ({ challenge, onClose }) => {
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [joining, setJoining] = useState(false);
  const [inviteTab, setInviteTab] = useState('friends'); // 'friends', 'search', 'email'
  const [searchQuery, setSearchQuery] = useState('');
  const [emailInvite, setEmailInvite] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  // Get friends from both friends list AND all streak partners from active challenges
  const { data: friendsData, loading: friendsLoading } = useQuery(GET_FRIENDS);
  const { data: challengesData, loading: challengesLoading } = useQuery(GET_MY_ACTIVE_CHALLENGES);
  
  // Combine friends and streak partners from all challenges
  const baseFriends = friendsData?.friends || [];
  const streakPartners = challengesData?.myActiveChallenges?.flatMap(uc => uc.partners || []) || [];
  
  // Debug logging

  // Merge and deduplicate by ID
  const uniqueFriendsMap = new Map();
  [...baseFriends, ...streakPartners].forEach(friend => {
    if (friend && friend.id) {
      uniqueFriendsMap.set(friend.id, friend);
    }
  });
  const friends = Array.from(uniqueFriendsMap.values());

  const [searchUsers, { data: searchData, loading: searchLoading }] = useLazyQuery(SEARCH_USERS);
  const searchResults = searchData?.searchUsers || [];
  
  const [sendFriendRequest, { loading: sendingFriendRequest }] = useMutation(SEND_FRIEND_REQUEST, {
    onCompleted: () => {
      alert('✅ Friend request sent successfully!');
      // Optionally refetch friends list after some time
      setTimeout(() => {
        // User needs to accept the request first
      }, 1000);
    },
    onError: (err) => {
      console.error('Friend request error:', err);
      alert('Error sending friend request: ' + err.message);
    }
  });
  
  const [inviteEmailToChallenge, { loading: sendingEmail }] = useMutation(INVITE_EMAIL_TO_CHALLENGE, {
    onCompleted: () => {
      alert('Invitation sent successfully!');
      setEmailInvite('');
      setInviteMessage('');
    },
    onError: (err) => {
      alert('Error sending invitation: ' + err.message);
    }
  });

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

  const handleSearch = () => {
    if (searchQuery.trim()) {
      searchUsers({ variables: { query: searchQuery } });
    }
  };

  const handleAddFriend = async (userId) => {
    await sendFriendRequest({ variables: { userId } });
  };

  const handleSendEmailInvite = async () => {
    if (!emailInvite.trim()) {
      alert('Please enter an email address');
      return;
    }
    
    await inviteEmailToChallenge({
      variables: {
        email: emailInvite,
        challengeId: challenge.id,
        message: inviteMessage || 'Join me on this challenge!'
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Join Challenge</h2>
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
          <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-xl p-6 border border-cyan-100">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-600 to-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{challenge.name}</h3>
                <p className="text-gray-700 text-sm mb-3">{challenge.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-indigo-700">
                    {challenge.duration} days
                  </span>
                  <span className="px-3 py-1 bg-white rounded-full text-sm font-medium text-cyan-700 capitalize">
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
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Users className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-2" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Invite Streak Partners (Optional)</h3>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedFriends.length} selected
              </span>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 mb-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setInviteTab('friends')}
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  inviteTab === 'friends'
                    ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>My Friends</span>
                </div>
              </button>
              <button
                onClick={() => setInviteTab('search')}
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  inviteTab === 'search'
                    ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Find Users</span>
                </div>
              </button>
              <button
                onClick={() => setInviteTab('email')}
                className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  inviteTab === 'email'
                    ? 'border-cyan-600 text-cyan-600 dark:text-cyan-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>Email Invite</span>
                </div>
              </button>
            </div>

            {/* Friends Tab */}
            {inviteTab === 'friends' && (
              <>
                {(friendsLoading || challengesLoading) ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <UserPlus className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No friends yet. Search for users or invite by email!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {friends.map((friend) => (
                      <label
                        key={friend.id}
                        className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedFriends.includes(friend.id)
                            ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedFriends.includes(friend.id)}
                          onChange={() => toggleFriend(friend.id)}
                          className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500 mr-3"
                        />
                        <div className="flex items-center flex-1">
                          {friend.profilePhoto ? (
                            <img
                              src={friend.profilePhoto}
                              alt={friend.displayName}
                              className="w-10 h-10 rounded-full mr-3"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-teal-600 flex items-center justify-center mr-3">
                              <span className="text-white font-semibold text-sm">
                                {friend.displayName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{friend.displayName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {friend.stats?.activeChallenges || 0} active challenges
                            </p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Search Tab */}
            {inviteTab === 'search' && (
              <>
                <div className="flex space-x-2 mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by name or email..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searchLoading}
                    className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                  >
                    {searchLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </button>
                </div>
                
                {searchResults.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                      >
                        <div className="flex items-center flex-1">
                          {user.profilePhoto ? (
                            <img src={user.profilePhoto} alt={user.displayName} className="w-10 h-10 rounded-full mr-3" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mr-3">
                              <span className="text-white font-semibold text-sm">
                                {user.displayName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-gray-100">{user.displayName}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddFriend(user.id)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Add Friend</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : searchQuery && !searchLoading ? (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Search className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No users found</p>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <Search className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">Search for users to add as friends</p>
                  </div>
                )}
              </>
            )}

            {/* Email Tab */}
            {inviteTab === 'email' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={emailInvite}
                    onChange={(e) => setEmailInvite(e.target.value)}
                    placeholder="friend@example.com"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Hey! Join me on this challenge!"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                
                <button
                  onClick={handleSendEmailInvite}
                  disabled={sendingEmail || !emailInvite.trim()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-5 h-5" />
                      <span>Send Invitation</span>
                    </>
                  )}
                </button>
                
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  💡 Tip: They'll receive an email with a link to join this challenge
                </p>
              </div>
            )}

            {inviteTab === 'friends' && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                💡 Tip: Selected friends will be invited as your streak partners
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleJoin}
            disabled={joining}
            className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center space-x-2"
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
