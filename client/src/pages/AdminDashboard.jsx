import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Shield, Users, MessageSquare, Target, Activity, CheckCircle, Clock, AlertCircle, StickyNote, Save, X, Bot, Power } from 'lucide-react';
import { GET_ALL_FEEDBACK, UPDATE_FEEDBACK_STATUS, ADD_FEEDBACK_NOTE, GET_SYSTEM_STATS, GET_SYSTEM_SETTINGS, UPDATE_SYSTEM_SETTINGS } from '../lib/graphql';
import Layout from '../components/common/Layout';

const AdminDashboard = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');

  const { data, loading, error, refetch } = useQuery(GET_ALL_FEEDBACK, {
    variables: { status: statusFilter || null, limit: 100 },
    fetchPolicy: 'network-only',
    onError: (err) => {
      console.error('❌ GET_ALL_FEEDBACK Error:', err);
      console.error('Error message:', err.message);
      console.error('GraphQL errors:', err.graphQLErrors);
      console.error('Network error:', err.networkError);
    },
    onCompleted: (data) => {
      console.log('✅ GET_ALL_FEEDBACK completed:', data?.allFeedback?.length, 'items');
    }
  });

  const { data: statsData, loading: statsLoading, error: statsError } = useQuery(GET_SYSTEM_STATS, {
    fetchPolicy: 'network-only',
    onError: (err) => {
      console.error('❌ GET_SYSTEM_STATS Error:', err);
      console.error('Error message:', err.message);
      console.error('GraphQL errors:', err.graphQLErrors);
      console.error('Network error:', err.networkError);
    },
    onCompleted: (data) => {
      console.log('✅ GET_SYSTEM_STATS completed:', data?.systemStats);
    }
  });

  const { data: settingsData, loading: settingsLoading } = useQuery(GET_SYSTEM_SETTINGS, {
    fetchPolicy: 'network-only',
    onError: (err) => {
      console.error('❌ GET_SYSTEM_SETTINGS Error:', err);
    },
    onCompleted: (data) => {
      console.log('✅ GET_SYSTEM_SETTINGS completed:', data?.systemSettings);
    }
  });

  const [updateSettings, { loading: updatingSettings }] = useMutation(UPDATE_SYSTEM_SETTINGS, {
    onCompleted: () => {
      alert('AI Coach settings updated successfully!');
    },
    onError: (err) => {
      console.error('Error updating settings:', err);
      alert('Failed to update settings: ' + err.message);
    },
    refetchQueries: [{ query: GET_SYSTEM_SETTINGS }]
  });

  const [updateStatus, { loading: updating }] = useMutation(UPDATE_FEEDBACK_STATUS, {
    onCompleted: () => {
      refetch();
    },
    onError: (err) => {
      console.error('Error updating status:', err);
      alert('Failed to update status: ' + err.message);
    }
  });

  const [addNote, { loading: savingNote }] = useMutation(ADD_FEEDBACK_NOTE, {
    onCompleted: () => {
      refetch();
      setEditingNote(null);
      setNoteText('');
    },
    onError: (err) => {
      console.error('Error adding note:', err);
      alert('Failed to save note: ' + err.message);
    }
  });

  const handleStatusChange = async (feedbackId, newStatus) => {
    try {
      await updateStatus({
        variables: {
          feedbackId: feedbackId,
          status: newStatus
        }
      });
    } catch (err) {
      console.error('Error in handleStatusChange:', err);
    }
  };

  const handleSaveNote = async (feedbackId) => {
    if (!noteText.trim()) {
      alert('Note cannot be empty');
      return;
    }

    try {
      await addNote({
        variables: {
          feedbackId: feedbackId,
          note: noteText
        }
      });
    } catch (err) {
      console.error('Error in handleSaveNote:', err);
    }
  };

  const startEditingNote = (feedback) => {
    setEditingNote(feedback.id);
    setNoteText(feedback.adminNotes || '');
  };

  const cancelEditingNote = () => {
    setEditingNote(null);
    setNoteText('');
  };

  // Debug logging - log early to see what's happening
  console.log('📊 Admin Dashboard Render:', {
    loading,
    statsLoading,
    error: error?.message,
    statsError: statsError?.message,
    hasData: !!data,
    hasStatsData: !!statsData,
    rawData: data,
    rawStatsData: statsData
  });

  const feedback = data?.allFeedback || [];
  const stats = statsData?.systemStats;
  const aiCoachEnabled = settingsData?.systemSettings?.aiCoachEnabled ?? true;

  const pendingCount = feedback.filter(f => f.status === 'pending').length;
  const reviewedCount = feedback.filter(f => f.status === 'reviewed').length;
  const resolvedCount = feedback.filter(f => f.status === 'resolved').length;

  // Show loading state
  if (loading || statsLoading || settingsLoading) {
    console.log('⏳ Loading admin dashboard data...');
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
        </div>
      </Layout>
    );
  }

  // Only show full error page if both queries fail
  if (error && statsError) {
    console.log('❌ Both queries failed, showing error page');
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-2xl mx-auto p-6">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Failed to load dashboard data. You may not have admin permissions.</p>
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-left space-y-2">
              <div>
                <p className="font-semibold text-red-800 dark:text-red-200">Feedback Error:</p>
                <p className="text-sm text-red-700 dark:text-red-300">{error.message}</p>
              </div>
              <div>
                <p className="font-semibold text-red-800 dark:text-red-200">Stats Error:</p>
                <p className="text-sm text-red-700 dark:text-red-300">{statsError.message}</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="mt-6 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  console.log('🎨 Rendering Admin Dashboard UI...');

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Error Warnings for Partial Failures */}
        {statsError && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">System Statistics Unavailable</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{statsError.message}</p>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">Feedback Data Unavailable</p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-cyan-600" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                Manage feedback submissions and view system statistics
              </p>
            </div>
          </div>
        </div>

        {/* AI Coach Global Control */}
        <div className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">AI Coach System Control</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {aiCoachEnabled 
                    ? 'AI Coach is currently enabled for all users' 
                    : 'AI Coach is currently disabled globally'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                updateSettings({
                  variables: { aiCoachEnabled: !aiCoachEnabled }
                });
              }}
              disabled={updatingSettings}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed ${
                aiCoachEnabled
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <Power className="w-5 h-5" />
              {updatingSettings ? 'Updating...' : (aiCoachEnabled ? 'Disable AI Coach' : 'Enable AI Coach')}
            </button>
          </div>
          <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              <strong>Note:</strong> This control will override individual user settings when disabled. 
              Users will not be able to access AI Coach features when globally disabled.
            </p>
          </div>
        </div>

        {/* System Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
              <Users className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-cyan-100 text-sm">Total Users</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <Target className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.totalChallenges.toLocaleString()}</p>
              <p className="text-blue-100 text-sm">Total Challenges</p>
            </div>

            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
              <CheckCircle className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.totalCheckIns.toLocaleString()}</p>
              <p className="text-teal-100 text-sm">Total Check-ins</p>
            </div>

            <div className="bg-gradient-to-br from-cyan-600 to-blue-600 rounded-xl p-6 text-white shadow-lg">
              <Activity className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.activeUsers.toLocaleString()}</p>
              <p className="text-cyan-100 text-sm">Active Users</p>
              <p className="text-xs text-cyan-200 mt-1">Last 30 days</p>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-teal-600 rounded-xl p-6 text-white shadow-lg">
              <Target className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{stats.activeChallenges.toLocaleString()}</p>
              <p className="text-blue-100 text-sm">Active Challenges</p>
            </div>
          </div>
        )}

        {/* Feedback Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{feedback.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Feedback</p>
              </div>
              <MessageSquare className="w-8 h-8 text-cyan-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-blue-600">{reviewedCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Reviewed</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Resolved</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {feedback.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No feedback submissions yet</p>
            </div>
          ) : (
            feedback.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {item.subject}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span>{item.name}</span>
                        <span>{item.email}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        disabled={updating}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                      </select>

                      <button
                        onClick={() => setSelectedFeedback(selectedFeedback === item.id ? null : item.id)}
                        className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                      >
                        {selectedFeedback === item.id ? 'Hide' : 'View'} Details
                      </button>
                    </div>
                  </div>

                  {selectedFeedback === item.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message:</p>
                        <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{item.message}</p>
                      </div>

                      {/* Admin Notes Section */}
                      <div className="mt-4 bg-cyan-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <StickyNote className="w-5 h-5 text-cyan-600" />
                            <p className="font-medium text-gray-900 dark:text-gray-100">Admin Notes</p>
                            {item.updatedAt && (
                              <span className="text-xs text-gray-500">
                                Last updated: {new Date(item.updatedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                          
                          {editingNote !== item.id && (
                            <button
                              onClick={() => startEditingNote(item)}
                              className="text-sm text-cyan-600 hover:text-cyan-700 font-medium"
                            >
                              {item.adminNotes ? 'Edit Note' : 'Add Note'}
                            </button>
                          )}
                        </div>

                        {editingNote === item.id ? (
                          <div>
                            <textarea
                              value={noteText}
                              onChange={(e) => setNoteText(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 mb-2"
                              rows={4}
                              placeholder="Add private notes about this feedback..."
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveNote(item.id)}
                                disabled={savingNote}
                                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                              >
                                <Save className="w-4 h-4" />
                                {savingNote ? 'Saving...' : 'Save Note'}
                              </button>
                              <button
                                onClick={cancelEditingNote}
                                disabled={savingNote}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500"
                              >
                                <X className="w-4 h-4" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {item.adminNotes || <span className="text-gray-400 italic">No notes yet</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
