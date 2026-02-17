import React from 'react';

/**
 * Loading Skeleton Components for nexLevel
 * Beautiful loading states that match the app's design
 */

// Base Skeleton Component
const Skeleton = ({ className = '', animate = true }) => (
  <div
    className={`bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded ${
      animate ? 'animate-pulse' : ''
    } ${className}`}
  />
);

// Card Skeleton
export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="h-2.5 w-full rounded-full" />
    </div>
  </div>
);

// Dashboard Hero Skeleton
export const HeroSkeleton = () => (
  <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 rounded-3xl p-8 sm:p-10 lg:p-12 overflow-hidden shadow-brand-lg">
    <div className="relative grid lg:grid-cols-2 gap-8 items-center">
      <div>
        <Skeleton className="h-8 w-32 mb-4 bg-white/20" />
        <Skeleton className="h-12 w-full mb-3 bg-white/30" />
        <Skeleton className="h-12 w-4/5 mb-6 bg-white/30" />
        <div className="flex flex-wrap gap-3">
          <Skeleton className="h-12 w-40 rounded-xl bg-white/40" />
          <Skeleton className="h-12 w-32 rounded-xl bg-white/20" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-2xl bg-white/20" />
        ))}
      </div>
    </div>
  </div>
);

// Challenge Grid Skeleton
export const ChallengeGridSkeleton = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="w-12 h-12 rounded-xl" />
      <Skeleton className="h-10 w-16" />
    </div>
    <Skeleton className="h-4 w-24" />
  </div>
);

// List Item Skeleton
export const ListItemSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
    <div className="flex items-start space-x-4">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  </div>
);

// AI Message Skeleton
export const AIMessageSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg">
    <div className="flex items-start space-x-4">
      <Skeleton className="w-10 h-10 rounded-xl flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
        <Skeleton className="h-3 w-32 mt-3" />
      </div>
    </div>
  </div>
);

// Badge Skeleton
export const BadgeSkeleton = () => (
  <div className="flex flex-col items-center">
    <Skeleton className="w-16 h-16 rounded-full" />
    <Skeleton className="h-3 w-16 mt-2" />
  </div>
);

// Badge Grid Skeleton
export const BadgeGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <BadgeSkeleton key={i} />
    ))}
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 4 }) => (
  <div className="flex items-center gap-4 p-4 border-b border-gray-200 dark:border-gray-700">
    {Array.from({ length: columns }).map((_, i) => (
      <Skeleton key={i} className="h-4 flex-1" />
    ))}
  </div>
);

// Full Page Skeleton (Dashboard)
export const DashboardSkeleton = () => (
  <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-6 lg:px-8">
    {/* Hero */}
    <HeroSkeleton />

    {/* Challenges Section */}
    <div>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-6 w-24" />
      </div>
      <ChallengeGridSkeleton count={3} />
    </div>

    {/* AI Coach Section */}
    <div>
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-12 w-40 rounded-xl" />
      </div>
      <div className="space-y-4">
        <AIMessageSkeleton />
        <AIMessageSkeleton />
      </div>
    </div>
  </div>
);

// Shimmer effect alternative (more sophisticated)
export const ShimmerSkeleton = ({ className = '', width = '100%', height = '20px' }) => (
  <div
    className={`relative overflow-hidden rounded ${className}`}
    style={{ width, height }}
  >
    <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700"></div>
    <div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
      style={{
        animation: 'shimmer 2s infinite',
        backgroundSize: '200% 100%',
      }}
    ></div>
    <style jsx>{`
      @keyframes shimmer {
        0% {
          background-position: -200% 0;
        }
        100% {
          background-position: 200% 0;
        }
      }
    `}</style>
  </div>
);

// Profile Skeleton
export const ProfileSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
    <div className="flex items-center gap-4 mb-6">
      <Skeleton className="w-20 h-20 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
    </div>
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  </div>
);

// Navigation Skeleton
export const NavigationSkeleton = () => (
  <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
    <div className="container mx-auto px-4 max-w-7xl">
      <div className="flex items-center justify-between h-16">
        <Skeleton className="w-32 h-8" />
        <div className="flex items-center space-x-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>
    </div>
  </nav>
);

export default Skeleton;
