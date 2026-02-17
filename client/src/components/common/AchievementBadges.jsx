import React from 'react';
import { Flame, Target, Calendar, Trophy, Zap, Star, Crown, Award, TrendingUp } from 'lucide-react';

/**
 * Achievement Badge System for nexLevel
 * Beautiful, gamified badges to celebrate user milestones
 */

// Badge data configuration
export const BADGE_DEFINITIONS = {
  // Streak Badges
  STREAK_3: {
    id: 'streak_3',
    name: '3-Day Streak',
    description: 'Completed 3 consecutive days',
    icon: Flame,
    color: 'from-orange-400 to-red-500',
    requirement: 3,
    type: 'streak',
  },
  STREAK_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Completed 7 consecutive days',
    icon: Flame,
    color: 'from-orange-500 to-red-600',
    requirement: 7,
    type: 'streak',
  },
  STREAK_30: {
    id: 'streak_30',
    name: 'Month Master',
    description: 'Completed 30 consecutive days',
    icon: Flame,
    color: 'from-red-500 to-pink-600',
    requirement: 30,
    type: 'streak',
  },
  STREAK_100: {
    id: 'streak_100',
    name: 'Century Champion',
    description: 'Completed 100 consecutive days',
    icon: Crown,
    color: 'from-yellow-400 to-orange-500',
    requirement: 100,
    type: 'streak',
  },
  
  // Challenge Badges
  FIRST_CHALLENGE: {
    id: 'first_challenge',
    name: 'First Steps',
    description: 'Joined your first challenge',
    icon: Target,
    color: 'from-blue-400 to-cyan-500',
    requirement: 1,
    type: 'challenge',
  },
  CHALLENGE_5: {
    id: 'challenge_5',
    name: 'Challenge Seeker',
    description: 'Completed 5 challenges',
    icon: Trophy,
    color: 'from-purple-400 to-pink-500',
    requirement: 5,
    type: 'challenge',
  },
  CHALLENGE_25: {
    id: 'challenge_25',
    name: 'Goal Crusher',
    description: 'Completed 25 challenges',
    icon: Award,
    color: 'from-purple-500 to-pink-600',
    requirement: 25,
    type: 'challenge',
  },
  
  // Check-in Badges
  CHECKIN_10: {
    id: 'checkin_10',
    name: 'Getting Started',
    description: '10 total check-ins',
    icon: Calendar,
    color: 'from-green-400 to-emerald-500',
    requirement: 10,
    type: 'checkin',
  },
  CHECKIN_50: {
    id: 'checkin_50',
    name: 'Dedicated',
    description: '50 total check-ins',
    icon: Calendar,
    color: 'from-green-500 to-teal-600',
    requirement: 50,
    type: 'checkin',
  },
  CHECKIN_100: {
    id: 'checkin_100',
    name: 'Consistency King',
    description: '100 total check-ins',
    icon: Zap,
    color: 'from-yellow-400 to-amber-500',
    requirement: 100,
    type: 'checkin',
  },
  
  // Special Badges
  PERFECT_WEEK: {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: '100% completion for 7 days',
    icon: Star,
    color: 'from-yellow-300 to-amber-400',
    requirement: 7,
    type: 'special',
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Check-in before 8 AM for 7 days',
    icon: TrendingUp,
    color: 'from-sky-400 to-blue-500',
    requirement: 7,
    type: 'special',
  },
};

// Badge Component
export const Badge = ({ badge, earned = false, showDetails = true, size = 'md' }) => {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const Icon = badge.icon;

  return (
    <div className={`group relative ${!earned && 'opacity-50 grayscale'}`}>
      {/* Badge circle */}
      <div className={`${sizes[size]} rounded-full bg-gradient-to-br ${badge.color} p-1 shadow-lg ${earned ? 'animate-pulse-slow' : ''}`}>
        <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
          <Icon className={`${iconSizes[size]} text-transparent bg-gradient-to-br ${badge.color} bg-clip-text`} style={{ fill: 'url(#badgeGrad)' }} />
        </div>
      </div>

      {/* Glow effect for earned badges */}
      {earned && (
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${badge.color} blur-xl opacity-30 group-hover:opacity-50 transition-opacity`}></div>
      )}

      {/* Lock icon for unearned badges */}
      {!earned && (
        <div className="absolute top-0 right-0 w-5 h-5 bg-gray-600 dark:bg-gray-500 rounded-full flex items-center justify-center text-white text-xs">
          🔒
        </div>
      )}

      {/* Tooltip on hover */}
      {showDetails && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-gray-900 dark:bg-gray-800 text-white px-3 py-2 rounded-lg shadow-xl text-sm whitespace-nowrap">
            <div className="font-semibold">{badge.name}</div>
            <div className="text-xs text-gray-300">{badge.description}</div>
            {!earned && (
              <div className="text-xs text-yellow-400 mt-1">
                🔒 Not yet earned
              </div>
            )}
          </div>
          <div className="w-2 h-2 bg-gray-900 dark:bg-gray-800 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1"></div>
        </div>
      )}
    </div>
  );
};

// Badge Grid Display
export const BadgeGrid = ({ userBadges = [], maxDisplay = 12 }) => {
  const allBadges = Object.values(BADGE_DEFINITIONS);
  const displayBadges = allBadges.slice(0, maxDisplay);

  return (
    <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
      {displayBadges.map((badge) => {
        const earned = userBadges.includes(badge.id);
        return (
          <div key={badge.id} className="flex flex-col items-center">
            <Badge badge={badge} earned={earned} size="md" />
            <p className="text-xs text-center mt-2 text-gray-600 dark:text-gray-400 font-medium">
              {badge.name}
            </p>
          </div>
        );
      })}
    </div>
  );
};

// Badge Notification (for when user earns a badge)
export const BadgeNotification = ({ badge, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 max-w-md shadow-2xl transform animate-bounce-slow">
        <div className="text-center">
          <div className="mb-4 text-4xl">🎉</div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Achievement Unlocked!
          </h3>
          
          <div className="my-6 flex justify-center">
            <Badge badge={badge} earned={true} showDetails={false} size="xl" />
          </div>
          
          <h4 className="text-xl font-bold text-transparent bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text mb-2">
            {badge.name}
          </h4>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {badge.description}
          </p>
          
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold shadow-brand transform hover:scale-105 transition-all duration-300"
          >
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
};

// Badge Progress Component
export const BadgeProgress = ({ badge, currentProgress }) => {
  const percentage = Math.min((currentProgress / badge.requirement) * 100, 100);
  const Icon = badge.icon;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 transition-all">
      <div className="flex items-center gap-4 mb-3">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${badge.color} p-0.5`}>
          <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">
            {badge.name}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {currentProgress} / {badge.requirement}
          </p>
        </div>
      </div>
      
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
        <div
          className={`h-2 bg-gradient-to-r ${badge.color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default Badge;
