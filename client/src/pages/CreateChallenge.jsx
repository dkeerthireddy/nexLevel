import { useState } from 'react';
import { useMutation, useQuery, useLazyQuery } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import { Plus, X, Target, Users, Check, Loader2, Search, Mail, UserPlus } from 'lucide-react';
import { CREATE_CHALLENGE, JOIN_CHALLENGE, GET_FRIENDS, GET_MY_ACTIVE_CHALLENGES, SEARCH_USERS, SEND_FRIEND_REQUEST, INVITE_EMAIL_TO_CHALLENGE } from '../lib/graphql';

const CreateChallenge = () => {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [createdChallengeId, setCreatedChallengeId] = useState(null);
  const [createdChallengeName, setCreatedChallengeName] = useState('');
  const [selectedPartners, setSelectedPartners] = useState([]);
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
  
  const [sendFriendRequest] = useMutation(SEND_FRIEND_REQUEST, {
    onCompleted: () => {
      alert('Friend request sent!');
    },
    onError: (err) => {
      alert('Error: ' + err.message);
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
  
  const [createChallenge, { loading, error }] = useMutation(CREATE_CHALLENGE, {
    onCompleted: (data) => {
      setCreatedChallengeId(data.createChallenge.id);
      setCreatedChallengeName(data.createChallenge.name);
      setShowJoinModal(true);
    }
  });
  
  const [joinChallenge, { loading: joiningChallenge }] = useMutation(JOIN_CHALLENGE, {
    onCompleted: () => {
      navigate('/challenges');
    },
    refetchQueries: [{ query: GET_MY_ACTIVE_CHALLENGES }]
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'fitness',
    frequency: 'daily',
    duration: 30,
    requirePhotoProof: false,
    allowGraceSkips: true,
    graceSkipsPerWeek: 1,
    isPublic: true,
  });

  const [tasks, setTasks] = useState([
    { title: '', description: '' }
  ]);

  const [customFrequency, setCustomFrequency] = useState({
    type: 'days_per_week', // 'days_per_week' or 'specific_days'
    daysPerWeek: 3,
    specificDays: [] // Array of day indices: 0 = Sunday, 1 = Monday, etc.
  });

  const [formError, setFormError] = useState('');

  const togglePartner = (partnerId) => {
    setSelectedPartners(prev =>
      prev.includes(partnerId)
        ? prev.filter(id => id !== partnerId)
        : [...prev, partnerId]
    );
  };

  const handleJoinChallenge = async () => {
    await joinChallenge({
      variables: {
        challengeId: createdChallengeId,
        partnerIds: selectedPartners
      }
    });
  };

  const handleSkipJoin = () => {
    navigate('/challenges');
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
        challengeId: createdChallengeId,
        message: inviteMessage || 'Join me on this challenge!'
      }
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addTask = () => {
    setTasks([...tasks, { title: '', description: '' }]);
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const updateTask = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation
    if (!formData.name.trim()) {
      setFormError('Challenge name is required');
      return;
    }

    if (!formData.description.trim()) {
      setFormError('Challenge description is required');
      return;
    }

    if (formData.duration < 1) {
      setFormError('Duration must be at least 1 day');
      return;
    }

    // Filter out empty tasks
    const validTasks = tasks
      .filter(task => task.title.trim())
      .map((task, index) => ({
        title: task.title.trim(),
        description: task.description.trim() || null,
        order: index
      }));

    try {
      await createChallenge({
        variables: {
          input: {
            ...formData,
            duration: parseInt(formData.duration),
            graceSkipsPerWeek: parseInt(formData.graceSkipsPerWeek),
            tasks: validTasks
          }
        }
      });
    } catch (err) {
      console.error('Create challenge error:', err);
      setFormError(err.message || 'Failed to create challenge');
    }
  };

  const categories = [
    { value: 'fitness', label: 'Fitness' },
    { value: 'health', label: 'Health' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'mindfulness', label: 'Mindfulness' },
    { value: 'learning', label: 'Learning' },
    { value: 'social', label: 'Social' },
    { value: 'creative', label: 'Creative' },
    { value: 'other', label: 'Other' },
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: '3x_week', label: '3x per Week' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Challenge</h1>
        <p className="text-gray-600">Design your own challenge with custom tasks and build streaks together</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Challenge Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Challenge Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., 75 Hard Challenge"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe what this challenge is about..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
          />
        </div>

        {/* Category and Frequency Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency
            </label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            >
              {frequencies.map(freq => (
                <option key={freq.value} value={freq.value}>{freq.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Frequency Options */}
        {formData.frequency === 'custom' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-gray-900">Custom Frequency Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency Type
              </label>
              <select
                value={customFrequency.type}
                onChange={(e) => setCustomFrequency({ ...customFrequency, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              >
                <option value="days_per_week">Number of days per week</option>
                <option value="specific_days">Specific days of the week</option>
              </select>
            </div>

            {customFrequency.type === 'days_per_week' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days per week: {customFrequency.daysPerWeek}
                </label>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={customFrequency.daysPerWeek}
                  onChange={(e) => setCustomFrequency({ ...customFrequency, daysPerWeek: parseInt(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 day</span>
                  <span>7 days</span>
                </div>
              </div>
            )}

            {customFrequency.type === 'specific_days' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select specific days
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        const newDays = customFrequency.specificDays.includes(index)
                          ? customFrequency.specificDays.filter(d => d !== index)
                          : [...customFrequency.specificDays, index];
                        setCustomFrequency({ ...customFrequency, specificDays: newDays });
                      }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        customFrequency.specificDays.includes(index)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
                {customFrequency.specificDays.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {customFrequency.specificDays.length} day{customFrequency.specificDays.length !== 1 ? 's' : ''} per week
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (days)
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            max="365"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Tasks Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Daily Tasks
            </label>
            <button
              type="button"
              onClick={addTask}
              className="flex items-center space-x-2 px-3 py-1 text-sm bg-indigo-50 text-cyan-600 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>

          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={index} className="flex gap-3 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={task.title}
                    onChange={(e) => updateTask(index, 'title', e.target.value)}
                    placeholder={`Task ${index + 1} title`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={task.description}
                    onChange={(e) => updateTask(index, 'description', e.target.value)}
                    placeholder="Task description (optional)"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                  />
                </div>
                {tasks.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTask(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-3 border-t pt-4">
          {/* Photo proof requirement temporarily disabled */}
          {/* <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="requirePhotoProof"
              checked={formData.requirePhotoProof}
              onChange={handleChange}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="text-sm text-gray-700">Require photo proof for check-ins</span>
          </label> */}

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="allowGraceSkips"
              checked={formData.allowGraceSkips}
              onChange={handleChange}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="text-sm text-gray-700">Allow grace skips</span>
          </label>

          {formData.allowGraceSkips && (
            <div className="ml-7">
              <label className="block text-sm text-gray-600 mb-1">Grace skips per week</label>
              <input
                type="number"
                name="graceSkipsPerWeek"
                value={formData.graceSkipsPerWeek}
                onChange={handleChange}
                min="0"
                max="7"
                className="w-32 px-3 py-1 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          )}

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
            <span className="text-sm text-gray-700">Make this challenge public</span>
          </label>
        </div>

        {/* Error Display */}
        {(formError || error) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{formError || error.message}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Target className="w-5 h-5" />
            <span>{loading ? 'Creating...' : 'Create Challenge'}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/challenges')}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Join & Invite Partners Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Challenge Created!</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{createdChallengeName}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-cyan-100 dark:border-cyan-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Would you like to join this challenge?
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Join now and invite your friends as streak partners for mutual accountability!
                </p>
              </div>

              {/* Invite Friends Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 text-gray-700 dark:text-gray-300 mr-2" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Invite Streak Partners (Optional)</h3>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedPartners.length} selected
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
                    {friendsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
                      </div>
                    ) : friends.length === 0 ? (
                      <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-600 dark:text-gray-400">No friends yet. Search for users or invite by email!</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {friends.map((friend) => (
                          <label
                            key={friend.id}
                            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              selectedPartners.includes(friend.id)
                                ? 'border-cyan-600 bg-cyan-50 dark:bg-cyan-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedPartners.includes(friend.id)}
                              onChange={() => togglePartner(friend.id)}
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
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center mr-3">
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
                        placeholder="Hey! I just created this challenge. Join me!"
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
                onClick={handleSkipJoin}
                className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium"
              >
                Skip for Now
              </button>
              <button
                onClick={handleJoinChallenge}
                disabled={joiningChallenge}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all disabled:opacity-50 flex items-center space-x-2"
              >
                {joiningChallenge ? (
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
      )}
    </div>
  );
};

export default CreateChallenge;
