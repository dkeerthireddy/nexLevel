import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, LogOut, Settings } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    const result = logout();
    if (result?.redirectTo) {
      navigate(result.redirectTo);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3">Profile</h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Manage your account and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-10 shadow-lg border-2 border-cyan-100 dark:border-cyan-900/30">
        <div className="flex items-center space-x-6 mb-8">
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={user.displayName}
              className="w-28 h-28 rounded-2xl shadow-lg border-4 border-cyan-100"
            />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl">
              <span className="text-white text-4xl font-bold drop-shadow-md">
                {user?.displayName?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{user?.displayName}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border-2 border-cyan-100 dark:border-cyan-900/30 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Email</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-5 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border-2 border-blue-100 dark:border-blue-900/30 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Member Since</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-10 shadow-lg border-2 border-cyan-100 dark:border-cyan-900/30">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-8">Your Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 lg:gap-6">
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-2 border-cyan-100 dark:border-cyan-900/30">
            <p className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">{user?.stats?.totalChallenges || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Total Challenges</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-100 dark:border-green-900/30">
            <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{user?.stats?.activeChallenges || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Active</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-100 dark:border-blue-900/30">
            <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{user?.stats?.completedChallenges || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Completed</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border-2 border-orange-100 dark:border-orange-900/30">
            <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{user?.stats?.longestStreak || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Longest Streak</p>
          </div>
          <div className="text-center p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20 border-2 border-cyan-100 dark:border-cyan-900/30">
            <p className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">{user?.stats?.totalCheckIns || 0}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 font-medium">Check-ins</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-10 shadow-lg border-2 border-cyan-100 dark:border-cyan-900/30">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-8">Account Actions</h3>
        <div className="space-y-4">
          <Link to="/settings" className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl hover:shadow-lg border-2 border-cyan-100 dark:border-cyan-900/30 transform hover:scale-105 transition-all">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-gray-900 dark:text-gray-100">Settings & Preferences</span>
            </div>
            <span className="text-cyan-400 dark:text-cyan-300 text-xl">→</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl hover:shadow-lg border-2 border-red-200 transform hover:scale-105 transition-all"
          >
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-md">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-red-600">Logout</span>
            </div>
            <span className="text-red-400 text-xl">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
