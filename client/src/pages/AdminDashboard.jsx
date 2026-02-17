import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_FEEDBACK, UPDATE_FEEDBACK_STATUS } from '../lib/graphql';
import { Mail, Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

const AdminDashboard = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);

  const { data, loading, error, refetch } = useQuery(GET_ALL_FEEDBACK, {
    variables: { status: statusFilter || null, limit: 100 },
    fetchPolicy: 'network-only'
  });

  const [updateStatus, { loading: updating }] = useMutation(UPDATE_FEEDBACK_STATUS, {
    onCompleted: () => {
      refetch();
      setSelectedFeedback(null);
    }
  });

  const handleStatusUpdate = async (feedbackId, newStatus) => {
    try {
      await updateStatus({
        variables: { feedbackId, status: newStatus }
      });
    } catch (err) {
      console.error('Error updating feedback status:', err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'reviewed':
        return <AlertCircle className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">Error loading feedback: {error.message}</p>
        </div>
      </div>
    );
  }

  const feedbackList = data?.allFeedback || [];
  const stats = {
    total: feedbackList.length,
    pending: feedbackList.filter(f => f.status === 'pending').length,
    reviewed: feedbackList.filter(f => f.status === 'reviewed').length,
    resolved: feedbackList.filter(f => f.status === 'resolved').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage feedback submissions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Mail className="w-8 h-8 text-gray-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400">Reviewed</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.reviewed}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-green-200 dark:border-green-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400">Resolved</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === ''
                  ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('reviewed')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'reviewed'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Reviewed
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                statusFilter === 'resolved'
                  ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Feedback List */}
        <div className="space-y-4">
          {feedbackList.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-lg">
              <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No feedback submissions found</p>
            </div>
          ) : (
            feedbackList.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {feedback.subject}
                      </h3>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(feedback.status)}`}>
                        {getStatusIcon(feedback.status)}
                        {feedback.status.charAt(0).toUpperCase() + feedback.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      From: <strong>{feedback.name}</strong> ({feedback.email})
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {new Date(feedback.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {feedback.message}
                  </p>
                </div>

                <div className="flex gap-2">
                  {feedback.status !== 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(feedback.id, 'pending')}
                      disabled={updating}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                      Mark as Pending
                    </button>
                  )}
                  {feedback.status !== 'reviewed' && (
                    <button
                      onClick={() => handleStatusUpdate(feedback.id, 'reviewed')}
                      disabled={updating}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                      Mark as Reviewed
                    </button>
                  )}
                  {feedback.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusUpdate(feedback.id, 'resolved')}
                      disabled={updating}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                      Mark as Resolved
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
