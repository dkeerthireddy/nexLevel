import React from 'react';
import { Target, Trophy, Sparkles, Users, Calendar, CheckCircle } from 'lucide-react';

/**
 * Empty State Illustrations for nexLevel
 * Beautiful, on-brand SVG illustrations for empty states
 */

// Empty Challenges State
export const EmptyChallenges = ({ size = 'lg' }) => {
  const sizes = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  return (
    <div className={`${sizes[size]} mx-auto relative`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="emptyGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        
        {/* Background circle */}
        <circle cx="100" cy="100" r="80" fill="url(#emptyGrad1)" opacity="0.1" />
        
        {/* Target icon */}
        <circle cx="100" cy="100" r="50" stroke="url(#emptyGrad1)" strokeWidth="4" fill="none" opacity="0.3" />
        <circle cx="100" cy="100" r="35" stroke="url(#emptyGrad1)" strokeWidth="4" fill="none" opacity="0.5" />
        <circle cx="100" cy="100" r="20" stroke="url(#emptyGrad1)" strokeWidth="4" fill="none" opacity="0.7" />
        <circle cx="100" cy="100" r="8" fill="url(#emptyGrad1)" />
        
        {/* Floating elements */}
        <circle cx="60" cy="60" r="4" fill="#8b5cf6" opacity="0.6" className="animate-float" />
        <circle cx="140" cy="70" r="3" fill="#ec4899" opacity="0.6" className="animate-float" style={{ animationDelay: '1s' }} />
        <circle cx="150" cy="130" r="5" fill="#f97316" opacity="0.6" className="animate-float" style={{ animationDelay: '2s' }} />
      </svg>
    </div>
  );
};

// Empty AI Messages State
export const EmptyAIMessages = ({ size = 'lg' }) => {
  const sizes = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  return (
    <div className={`${sizes[size]} mx-auto relative`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="aiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        
        {/* Chat bubble */}
        <rect x="40" y="60" width="120" height="80" rx="16" fill="url(#aiGrad)" opacity="0.2" />
        <rect x="30" y="50" width="120" height="80" rx="16" fill="url(#aiGrad)" opacity="0.3" />
        
        {/* Main chat bubble */}
        <rect x="20" y="40" width="120" height="80" rx="16" fill="url(#aiGrad)" opacity="0.5" />
        
        {/* Sparkle stars */}
        <g transform="translate(150, 60)">
          <path d="M0,-10 L2,0 L10,2 L2,0 L0,10 L-2,0 L-10,2 L-2,0 Z" fill="#ec4899" className="animate-pulse" />
        </g>
        <g transform="translate(165, 90)">
          <path d="M0,-6 L1.2,0 L6,1.2 L1.2,0 L0,6 L-1.2,0 L-6,1.2 L-1.2,0 Z" fill="#8b5cf6" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
        </g>
        <g transform="translate(145, 110)">
          <path d="M0,-8 L1.6,0 L8,1.6 L1.6,0 L0,8 L-1.6,0 L-8,1.6 L-1.6,0 Z" fill="#f97316" className="animate-pulse" style={{ animationDelay: '1s' }} />
        </g>
        
        {/* Text lines */}
        <rect x="35" y="55" width="60" height="4" rx="2" fill="white" opacity="0.8" />
        <rect x="35" y="70" width="80" height="4" rx="2" fill="white" opacity="0.6" />
        <rect x="35" y="85" width="50" height="4" rx="2" fill="white" opacity="0.4" />
      </svg>
    </div>
  );
};

// Empty Progress/Stats State
export const EmptyProgress = ({ size = 'lg' }) => {
  const sizes = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  return (
    <div className={`${sizes[size]} mx-auto relative`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        
        {/* Chart bars */}
        <rect x="40" y="120" width="20" height="40" rx="4" fill="url(#progressGrad)" opacity="0.3" />
        <rect x="70" y="100" width="20" height="60" rx="4" fill="url(#progressGrad)" opacity="0.4" />
        <rect x="100" y="80" width="20" height="80" rx="4" fill="url(#progressGrad)" opacity="0.5" />
        <rect x="130" y="60" width="20" height="100" rx="4" fill="url(#progressGrad)" opacity="0.6" />
        
        {/* Trending up arrow */}
        <path 
          d="M 55 110 L 80 85 L 110 65 L 140 45" 
          stroke="#ec4899" 
          strokeWidth="3" 
          strokeLinecap="round"
          strokeDasharray="5,5"
          opacity="0.7"
        />
        <path d="M 140 45 L 130 45 L 140 35 L 150 45 Z" fill="#ec4899" opacity="0.7" />
        
        {/* Background circle */}
        <circle cx="100" cy="100" r="90" stroke="url(#progressGrad)" strokeWidth="2" fill="none" opacity="0.1" />
      </svg>
    </div>
  );
};

// Empty Notifications State
export const EmptyNotifications = ({ size = 'lg' }) => {
  const sizes = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  return (
    <div className={`${sizes[size]} mx-auto relative`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="notifGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        
        {/* Bell body */}
        <path 
          d="M 100 140 C 80 140 70 130 70 110 L 70 80 C 70 60 80 50 100 50 C 120 50 130 60 130 80 L 130 110 C 130 130 120 140 100 140 Z"
          fill="url(#notifGrad)"
          opacity="0.3"
        />
        
        {/* Bell top */}
        <rect x="95" y="40" width="10" height="15" rx="5" fill="url(#notifGrad)" opacity="0.4" />
        
        {/* Bell bottom */}
        <path d="M 60 140 Q 100 150 140 140" stroke="url(#notifGrad)" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        
        {/* Sound waves */}
        <path d="M 145 70 Q 155 80 145 90" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" className="animate-pulse" />
        <path d="M 155 60 Q 170 80 155 100" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
        
        <path d="M 55 70 Q 45 80 55 90" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.6" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
        <path d="M 45 60 Q 30 80 45 100" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.4" className="animate-pulse" style={{ animationDelay: '0.9s' }} />
      </svg>
    </div>
  );
};

// Empty Partners/Friends State
export const EmptyPartners = ({ size = 'lg' }) => {
  const sizes = {
    sm: 'w-32 h-32',
    md: 'w-48 h-48',
    lg: 'w-64 h-64',
  };

  return (
    <div className={`${sizes[size]} mx-auto relative`}>
      <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="partnerGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="partnerGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
        
        {/* Left person */}
        <circle cx="70" cy="80" r="20" fill="url(#partnerGrad1)" opacity="0.5" />
        <circle cx="70" cy="130" r="25" fill="url(#partnerGrad1)" opacity="0.3" />
        
        {/* Right person */}
        <circle cx="130" cy="80" r="20" fill="url(#partnerGrad2)" opacity="0.5" />
        <circle cx="130" cy="130" r="25" fill="url(#partnerGrad2)" opacity="0.3" />
        
        {/* Connection heart */}
        <path 
          d="M 100 105 C 100 95 105 90 110 90 C 113 90 115 92 116 95 C 117 92 119 90 122 90 C 127 90 132 95 132 105 C 132 115 116 125 116 125 C 116 125 100 115 100 105 Z"
          fill="#f97316"
          opacity="0.6"
          className="animate-pulse"
        />
        
        {/* Plus sign for adding */}
        <circle cx="160" cy="60" r="15" fill="url(#partnerGrad2)" opacity="0.4" />
        <path d="M 160 52 L 160 68" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M 152 60 L 168 60" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
};

// Generic empty state with icon
export const EmptyState = ({ 
  icon: Icon = Target, 
  title = "Nothing here yet", 
  description = "Get started by creating something new",
  actionLabel,
  onAction,
  size = 'lg'
}) => {
  return (
    <div className="text-center py-12">
      <div className="relative inline-block mb-6">
        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
          <Icon className="w-12 h-12 text-purple-500 dark:text-purple-400" />
        </div>
        <div className="absolute inset-0 w-24 h-24 mx-auto bg-purple-400 dark:bg-purple-600 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
      </div>
      
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl hover:shadow-brand transform hover:scale-105 transition-all duration-300 shadow-lg font-semibold"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
