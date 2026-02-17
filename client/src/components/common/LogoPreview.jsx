import React from 'react';
import { LogoFlame, LogoCircular, LogoDuo } from './Logo';

/**
 * Logo Preview Component - Shows all three logo options
 * This is for demonstration purposes to help choose the best logo
 */
const LogoPreview = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            StreakMate Logo Options
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose your favorite logo design for the app
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Option 1: Flame + Lightning */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-purple-500 transition-all">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Option 1: Flame
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Energy & Momentum
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-8">
              {/* Large size */}
              <div className="flex items-center justify-center">
                <LogoFlame className="w-24 h-24" />
              </div>
              
              {/* With text */}
              <div className="flex items-center gap-3">
                <LogoFlame className="w-12 h-12" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  StreakMate
                </span>
              </div>

              {/* Small sizes */}
              <div className="flex items-center gap-4">
                <LogoFlame className="w-8 h-8" />
                <LogoFlame className="w-10 h-10" />
                <LogoFlame className="w-12 h-12" />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Concept:</strong> Represents continuous energy, passion, and the lightning-fast momentum of building streaks.
              </p>
            </div>
          </div>

          {/* Option 2: Circular Progress */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-pink-500 transition-all">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Option 2: Circular
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Progress & Achievement
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-8">
              {/* Large size */}
              <div className="flex items-center justify-center">
                <LogoCircular className="w-24 h-24" />
              </div>
              
              {/* With text */}
              <div className="flex items-center gap-3">
                <LogoCircular className="w-12 h-12" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  StreakMate
                </span>
              </div>

              {/* Small sizes */}
              <div className="flex items-center gap-4">
                <LogoCircular className="w-8 h-8" />
                <LogoCircular className="w-10 h-10" />
                <LogoCircular className="w-12 h-12" />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Concept:</strong> Clean, modern design showing progress tracking with a checkmark for completed streaks.
              </p>
            </div>
          </div>

          {/* Option 3: Duo Figures */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border-2 border-transparent hover:border-orange-500 transition-all">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Option 3: Duo
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Partnership & Together
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-8">
              {/* Large size */}
              <div className="flex items-center justify-center">
                <LogoDuo className="w-24 h-24" />
              </div>
              
              {/* With text */}
              <div className="flex items-center gap-3">
                <LogoDuo className="w-12 h-12" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  StreakMate
                </span>
              </div>

              {/* Small sizes */}
              <div className="flex items-center gap-4">
                <LogoDuo className="w-8 h-8" />
                <LogoDuo className="w-10 h-10" />
                <LogoDuo className="w-12 h-12" />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Concept:</strong> Emphasizes the "mate" in StreakMate - showing partnership and support together.
              </p>
            </div>
          </div>
        </div>

        {/* Dark mode preview */}
        <div className="bg-gray-900 rounded-2xl shadow-xl p-8 mb-8">
          <h3 className="text-xl font-bold text-white mb-6 text-center">
            Dark Mode Preview
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-12">
            <div className="flex flex-col items-center gap-2">
              <LogoFlame className="w-16 h-16" />
              <span className="text-sm text-gray-400">Flame</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LogoCircular className="w-16 h-16" />
              <span className="text-sm text-gray-400">Circular</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <LogoDuo className="w-16 h-16" />
              <span className="text-sm text-gray-400">Duo</span>
            </div>
          </div>
        </div>

        {/* Usage guide */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            How to Use
          </h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>
              <code className="bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded text-purple-600 dark:text-purple-400">
                &lt;Logo variant="flame" size="md" showText={true} /&gt;
              </code>
            </p>
            <p>
              <code className="bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded text-pink-600 dark:text-pink-400">
                &lt;Logo variant="circular" size="lg" showText={false} /&gt;
              </code>
            </p>
            <p>
              <code className="bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded text-orange-600 dark:text-orange-400">
                &lt;Logo variant="duo" size="sm" /&gt;
              </code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoPreview;
