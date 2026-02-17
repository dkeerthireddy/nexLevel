import React from 'react';

/**
 * nexLevel Logo Component - Professional Blue/Teal Palette
 * Three variants: flame, minimal, gradient
 */
const Logo = ({ variant = 'flame', size = 'md', showText = true, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20'
  };

  const iconSize = sizeClasses[size] || sizeClasses.md;

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const textSize = textSizeClasses[size] || textSizeClasses.md;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo Icon */}
      {variant === 'flame' && (
        <svg viewBox="0 0 100 100" className={iconSize} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#14b8a6', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <path
            d="M50 10 C35 25, 30 35, 30 50 C30 65, 38 75, 50 85 C62 75, 70 65, 70 50 C70 35, 65 25, 50 10 Z"
            fill="url(#flameGradient)"
            className="drop-shadow-lg"
          />
          <path
            d="M50 30 C42 38, 40 43, 40 50 C40 58, 44 63, 50 68 C56 63, 60 58, 60 50 C60 43, 58 38, 50 30 Z"
            fill="#FFF"
            opacity="0.3"
          />
          <circle cx="50" cy="50" r="8" fill="#FFF" opacity="0.8"/>
          <text x="50" y="55" fontSize="12" fill="#2563eb" fontWeight="bold" textAnchor="middle">∞</text>
        </svg>
      )}

      {variant === 'minimal' && (
        <svg viewBox="0 0 100 100" className={iconSize} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="minimalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="40" fill="url(#minimalGradient)" className="drop-shadow-xl"/>
          <text x="50" y="65" fontSize="48" fill="#FFF" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">nL</text>
        </svg>
      )}

      {variant === 'gradient' && (
        <svg viewBox="0 0 100 100" className={iconSize} fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradientLogo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#3b82f6', stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: '#0d9488', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#2563eb', stopOpacity: 1 }} />
            </linearGradient>
          </defs>
          <rect width="100" height="100" rx="20" fill="url(#gradientLogo)" className="drop-shadow-2xl"/>
          <path
            d="M30 50 L45 65 L70 35"
            stroke="#FFF"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M75 70 C72 73, 70 75, 70 78 C70 82, 72 84, 75 86 C78 84, 80 82, 80 78 C80 75, 78 73, 75 70 Z"
            fill="#FFF"
            opacity="0.8"
          />
        </svg>
      )}

      {/* Logo Text */}
      {showText && (
        <span className={`font-bold text-gray-900 dark:text-white ${textSize}`}>
          nexLevel
        </span>
      )}
    </div>
  );
};

export default Logo;
