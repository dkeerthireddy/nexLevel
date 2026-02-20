import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_ACTIVE_CHALLENGES, CHECK_IN, RENAME_CHALLENGE, EXIT_CHALLENGE, INVITE_EMAIL_TO_USER_CHALLENGE } from '../lib/graphql';
import { Flame, CheckCircle, Calendar, Users, Loader2, Edit2, LogOut, Mail, MoreVertical, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyChallenges = () => {
  const navigate = useNavigate();
  const { data, loading, refetch } = useQuery(GET_MY_ACTIVE_CHALLENGES, {
    fetchPolicy: 'cache-and-network',
  });
  const [checkingIn, setCheckingIn] = useState(null);
  const [checkInNote, setCheckInNote] = useState('');
  const [expandedTask, setExpandedTask] = useState(null); // Format: "userChallengeId-taskId"
  const [showMenu, setShowMenu] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(null);
  const [newChallengeName, setNewChallengeName] = useState('');
  const [showExitModal, setShowExitModal] = useState(null);
  const [exitReason, setExitReason] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');

  const [checkInMutation] = useMutation(CHECK_IN, {
    onCompleted: () => {
      refetch();
      setCheckingIn(null);
      setExpandedTask(null);
      setCheckInNote('');
      alert('✅ Check-in completed successfully!');
    },
    onError: (error) => {
      alert('❌ ' + error.message);
      setCheckingIn(null);
    }
  });

  const [renameMutation] = useMutation(RENAME_CHALLENGE, {
    onCompleted: () => {
      refetch();
      setShowRenameModal(null);
      setNewChallengeName('');
      alert('Challenge renamed successfully!');
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const [exitMutation] = useMutation(EXIT_CHALLENGE, {
    onCompleted: () => {
      refetch();
      setShowExitModal(null);
      setExitReason('');
      alert('You have exited the challenge.');
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const [inviteMutation] = useMutation(INVITE_EMAIL_TO_USER_CHALLENGE, {
    onCompleted: () => {
      setShowInviteModal(null);
      setInviteEmail('');
      setInviteMessage('');
      alert('✅ Invitation sent! They will join your specific challenge instance and become your friend.');
    },
    onError: (error) => {
      alert(error.message);
    }
  });

  const handleCheckIn = async (userChallengeId, taskId) => {
    if (!taskId) {
      alert('Please select a task to check in');
      return;
    }
    setCheckingIn(userChallengeId);
    await checkInMutation({
      variables: {
        userChallengeId,
        taskId,
        note: checkInNote || null
      }
    });
  };

  const toggleTaskExpand = (userChallengeId, taskId) => {
    const key = `${userChallengeId}-${taskId}`;
    if (expandedTask === key) {
      setExpandedTask(null);
      setCheckInNote('');
    } else {
      setExpandedTask(key);
      setCheckInNote('');
    }
  };

  const handleRename = async (challengeId) => {
    if (!newChallengeName.trim()) {
      alert('Please enter a new name');
      return;
    }
    await renameMutation({
      variables: {
        challengeId,
        newName: newChallengeName.trim()
      }
    });
  };

  const handleExit = async (userChallengeId) => {
    if (!confirm('Are you sure you want to exit this challenge? This action cannot be undone.')) {
      return;
    }
    await exitMutation({
      variables: {
        userChallengeId,
        reason: exitReason.trim() || null
      }
    });
  };

  const handleInvite = async (userChallengeId) => {
    if (!inviteEmail.trim()) {
      alert('Please enter an email address');
      return;
    }
    await inviteMutation({
      variables: {
        userChallengeId, // Pass instance ID
        email: inviteEmail.trim(),
        message: inviteMessage.trim() || null
      }
    });
  };

  const activeChallenges = data?.myActiveChallenges || [];

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Challenges</h1>
        <a
          href="/browse"
          className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all"
        >
          Join New Challenge
        </a>
      </div>

      {activeChallenges.length === 0 ? (
        <div className="bg-white dark:bg-card rounded-xl p-6 sm:p-12 text-center border border-gray-200 dark:border-border">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No active challenges</h3>
          <p className="text-gray-600 mb-6">Join your first challenge and start building better habits!</p>
          <a
            href="/browse"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all"
          >
            Browse Challenges
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {activeChallenges.map((uc) => (
            <div
              key={uc.id}
              className="bg-white dark:bg-card rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 dark:border-border hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div 
                  className="flex-1 cursor-pointer group"
                  onClick={() => navigate(`/challenge/${uc.challenge.id}`)}
                  title="View challenge details"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">
                      {uc.challenge.name}
                    </h3>
                    <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{uc.challenge.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 text-xs rounded-full font-medium">
                      {uc.challenge.category}
                    </span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                      {uc.challenge.frequency}
                    </span>
                    <span className="px-3 py-1 bg-cyan-100 text-cyan-700 text-xs rounded-full font-medium">
                      {uc.challenge.duration} days
                    </span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      {uc.challenge.challengeType || 'solo'}
                    </span>
                  </div>
                </div>
                
                {/* Menu Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowMenu(showMenu === uc.id ? null : uc.id)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showMenu === uc.id && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <button
                        onClick={() => {
                          setShowRenameModal(uc.id);
                          setNewChallengeName(uc.challenge.name);
                          setShowMenu(null);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700"
                      >
                        <Edit2 className="w-4 h-4" />
                        <span>Rename Challenge</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowInviteModal(uc.id);
                          setShowMenu(null);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700 border-t border-gray-100"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Invite Friend via Email</span>
                      </button>
                      <button
                        onClick={() => {
                          setShowExitModal(uc.id);
                          setShowMenu(null);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 text-red-600 border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Exit Challenge</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Flame className="w-5 h-5 text-orange-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{uc.currentStreak}</p>
                  <p className="text-xs text-gray-600">Current Streak</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{uc.totalCheckIns}</p>
                  <p className="text-xs text-gray-600">Check-ins</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="w-5 h-5 text-cyan-500" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(uc.completionRate)}%</p>
                  <p className="text-xs text-gray-600">Completion</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Progress</span>
                  <span className="text-sm font-semibold text-gray-900">{Math.round(uc.completionRate)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${Math.min(uc.completionRate, 100)}%` }}
                  />
                </div>
              </div>

              {/* Participants - Show all users in this challenge instance */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Challenge Participants</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {uc.allParticipants?.length || 0} {uc.allParticipants?.length === 1 ? 'person' : 'people'}
                  </span>
                </div>
                
                {/* Participants List */}
                {uc.allParticipants && uc.allParticipants.length > 0 ? (
                  <div className="space-y-2">
                    {uc.allParticipants.slice(0, 5).map((participant) => (
                      <div
                        key={participant.user.id}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          participant.isYou 
                            ? 'bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800' 
                            : 'bg-gray-50 dark:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          {/* Avatar */}
                          {participant.user.profilePhoto ? (
                            <img
                              src={participant.user.profilePhoto}
                              alt={participant.user.displayName}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center flex-shrink-0">
                              <span className="text-white text-xs font-semibold">
                                {participant.user.displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          {/* Name */}
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-medium truncate ${
                              participant.isYou 
                                ? 'text-cyan-900 dark:text-cyan-100' 
                                : 'text-gray-900 dark:text-gray-100'
                            }`}>
                              {participant.user.displayName}
                              {participant.isYou && (
                                <span className="ml-1 text-xs text-cyan-600 dark:text-cyan-400">(You)</span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        {/* Stats */}
                        <div className="flex items-center space-x-3 text-xs ml-2">
                          <div className="flex items-center text-orange-600 dark:text-orange-400" title="Current Streak">
                            <Flame className="w-3 h-3 mr-1" />
                            <span className="font-semibold">{participant.currentStreak}</span>
                          </div>
                          <div className="text-gray-600 dark:text-gray-400" title="Check-ins">
                            <span className="font-medium">{participant.totalCheckIns}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show more indicator */}
                    {uc.allParticipants.length > 5 && (
                      <div className="text-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          +{uc.allParticipants.length - 5} more {uc.allParticipants.length - 5 === 1 ? 'participant' : 'participants'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Solo challenge</span>
                  </div>
                )}
              </div>

              {/* Tasks Section with Inline Check-in */}
              {uc.challenge.tasks && uc.challenge.tasks.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Today's Tasks</h4>
                  <div className="space-y-2">
                    {[...uc.challenge.tasks].sort((a, b) => a.order - b.order).map((task) => {
                      const taskProg = uc.taskProgress?.find(tp => tp.taskId === task.id);
                      const isCompleted = taskProg?.completed || false;
                      const completedCount = taskProg?.completedCount || 0;
                      const taskKey = `${uc.id}-${task.id}`;
                      const isExpanded = expandedTask === taskKey;
                      
                      return (
                        <div key={task.id} className={`border-2 rounded-lg transition-all ${
                          isCompleted 
                            ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800' 
                            : isExpanded
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer'
                        }`}>
                          <button
                            onClick={() => !isCompleted && toggleTaskExpand(uc.id, task.id)}
                            disabled={isCompleted}
                            className="w-full p-4 text-left"
                          >
                            <div className="flex items-start space-x-3">
                              <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                                isCompleted ? 'text-green-600' : 'text-gray-400'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <p className={`font-medium ${
                                    isCompleted ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-gray-100'
                                  }`}>
                                    {task.title}
                                  </p>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                    {completedCount} {completedCount === 1 ? 'time' : 'times'}
                                  </span>
                                </div>
                                {task.description && (
                                  <p className={`text-sm mt-1 ${
                                    isCompleted ? 'text-gray-600 dark:text-gray-400' : 'text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>

                          {/* Inline Check-in Interface */}
                          {isExpanded && !isCompleted && (
                            <div className="px-4 pb-4 space-y-3 border-t border-cyan-200 dark:border-cyan-800 pt-3">
                              <textarea
                                value={checkInNote}
                                onChange={(e) => setCheckInNote(e.target.value)}
                                placeholder="Add a note about this task... (optional)"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                rows={2}
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleCheckIn(uc.id, task.id)}
                                  disabled={checkingIn === uc.id}
                                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                                >
                                  {checkingIn === uc.id ? (
                                    <>
                                      <Loader2 className="w-4 h-4 animate-spin" />
                                      <span>Checking in...</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      <span>Check In Now</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => {
                                    setExpandedTask(null);
                                    setCheckInNote('');
                                  }}
                                  className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          ))}
        </div>
      )}


      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Rename Challenge</h3>
            <input
              type="text"
              value={newChallengeName}
              onChange={(e) => setNewChallengeName(e.target.value)}
              placeholder="Enter new challenge name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent mb-4"
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const challenge = activeChallenges.find(c => c.id === showRenameModal);
                  handleRename(challenge.challenge.id);
                }}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold py-3 rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all"
              >
                Rename
              </button>
              <button
                onClick={() => {
                  setShowRenameModal(null);
                  setNewChallengeName('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exit Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Exit Challenge</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to exit this challenge? Your partners will be notified.</p>
            <textarea
              value={exitReason}
              onChange={(e) => setExitReason(e.target.value)}
              placeholder="Reason for exiting (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none mb-4"
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => handleExit(showExitModal)}
                className="flex-1 bg-red-600 text-white font-semibold py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                Exit Challenge
              </button>
              <button
                onClick={() => {
                  setShowExitModal(null);
                  setExitReason('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Invite Friend via Email</h3>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Friend's email address"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent mb-4"
            />
            <textarea
              value={inviteMessage}
              onChange={(e) => setInviteMessage(e.target.value)}
              placeholder="Personal message (optional)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none mb-4"
              rows={3}
            />
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  const challenge = activeChallenges.find(c => c.id === showInviteModal);
                  handleInvite(challenge.id); // Pass userChallenge instance ID
                }}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-semibold py-3 rounded-lg hover:from-cyan-700 hover:to-teal-700 transition-all"
              >
                Send Invitation
              </button>
              <button
                onClick={() => {
                  setShowInviteModal(null);
                  setInviteEmail('');
                  setInviteMessage('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyChallenges;
