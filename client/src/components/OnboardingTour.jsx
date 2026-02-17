import { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Sparkles, Target, Trophy, Users, TrendingUp } from 'lucide-react';

/**
 * Enhanced Onboarding Tour Component
 * Welcome tour with sample challenges and quick wins for new users
 */
const OnboardingTour = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Check if user has seen the tour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenOnboardingTour');
    if (!hasSeenTour) {
      setShowTour(true);
    }
  }, []);

  const tourSteps = [
    {
      title: "Welcome to StreakMate! 🎉",
      description: "Let's take a quick tour to help you get started. You'll learn how to create challenges, track progress, and stay motivated with friends!",
      icon: Sparkles,
      color: "from-cyan-600 to-blue-600",
      illustration: "welcome",
      highlight: null,
    },
    {
      title: "Browse & Join Challenges 🎯",
      description: "Explore our curated challenges or create your own! From fitness to productivity, find challenges that match your goals.",
      icon: Target,
      color: "from-blue-600 to-cyan-600",
      image: "🎯",
      highlight: "browse",
      quickWin: "Browse popular challenges",
    },
    {
      title: "Daily Check-ins ✅",
      description: "Build consistency with daily check-ins. Track your progress, add notes, and even upload photos to verify your work!",
      icon: Check,
      color: "from-green-600 to-emerald-600",
      image: "✓",
      highlight: "challenges",
      quickWin: "Complete your first check-in",
    },
    {
      title: "Partner with Friends 👥",
      description: "Streaks work better together! Invite friends to join your challenges and motivate each other to succeed.",
      icon: Users,
      color: "from-orange-600 to-amber-600",
      illustration: "partners",
      highlight: "partners",
      quickWin: "Invite a friend",
    },
    {
      title: "Track Your Progress 📊",
      description: "Watch your streaks grow! See your stats, completion rates, and celebrate milestones with achievements and badges.",
      icon: TrendingUp,
      color: "from-indigo-600 to-purple-600",
      image: "📈",
      highlight: "progress",
      quickWin: "View your dashboard",
    },
    {
      title: "AI Coach & Insights 🤖",
      description: "Get personalized motivation, challenge suggestions, and insights from your AI coach. It learns from your patterns to help you succeed!",
      icon: Sparkles,
      color: "from-pink-600 to-rose-600",
      image: "🤖",
      highlight: "ai-coach",
      quickWin: "Chat with AI Coach",
    },
  ];

  const sampleChallenges = [
    {
      title: "30-Day Fitness Challenge",
      description: "Exercise for 30 minutes daily",
      category: "Fitness",
      duration: 30,
      icon: "💪",
      difficulty: "Beginner",
    },
    {
      title: "Daily Meditation",
      description: "Meditate for 10 minutes each day",
      category: "Wellness",
      duration: 21,
      icon: "🧘",
      difficulty: "Easy",
    },
    {
      title: "Read Every Day",
      description: "Read for 20 minutes daily",
      category: "Learning",
      duration: 30,
      icon: "📚",
      difficulty: "Easy",
    },
    {
      title: "Morning Routine",
      description: "Complete your morning routine by 8 AM",
      category: "Productivity",
      duration: 14,
      icon: "☀️",
      difficulty: "Medium",
    },
  ];

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      completeTour();
    } else {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    completeTour();
  };

  const completeTour = () => {
    localStorage.setItem('hasSeenOnboardingTour', 'true');
    setShowTour(false);
    if (onComplete) onComplete();
  };

  if (!showTour) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className={`relative bg-gradient-to-r ${currentStepData.color} p-6 sm:p-8 text-white overflow-hidden`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          </div>
          
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="text-6xl mb-4">{currentStepData.image}</div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">{currentStepData.title}</h2>
              <p className="text-white/90 text-sm sm:text-base">{currentStepData.description}</p>
            </div>
            <button
              onClick={handleSkip}
              className="p-2 hover:bg-white/20 rounded-full transition-colors ml-4"
              aria-label="Close tour"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress indicator */}
          <div className="mt-6 flex items-center space-x-2">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-white'
                    : index < currentStep
                    ? 'w-2 bg-white/80'
                    : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Sample challenges section for step 1 */}
          {currentStep === 1 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                Try These Popular Challenges
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {sampleChallenges.map((challenge, index) => (
                  <div
                    key={index}
                    className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-200 dark:border-purple-800 rounded-xl hover:shadow-lg transition-all cursor-pointer"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-3xl">{challenge.icon}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                          {challenge.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                          {challenge.description}
                        </p>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full">
                            {challenge.duration} days
                          </span>
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                            {challenge.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick wins section */}
          {currentStepData.quickWin && (
            <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-l-4 border-yellow-500 dark:border-yellow-600 rounded-lg">
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                    Quick Win Challenge
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {currentStepData.quickWin} to earn your first achievement! 🏆
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tips for each step */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-2 flex items-center">
              <Sparkles className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
              Pro Tip
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {currentStep === 0 && "Complete the tour to unlock your first achievement and get a head start!"}
              {currentStep === 1 && "Start with an easy challenge to build momentum. Success breeds success!"}
              {currentStep === 2 && "Check in at the same time each day to build a strong habit."}
              {currentStep === 3 && "Friends are 65% more likely to help you complete your challenges!"}
              {currentStep === 4 && "Streaks are powerful! Even one day can make the difference."}
              {currentStep === 5 && "Your AI Coach learns from your patterns and provides personalized insights."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 sm:p-8 pt-0 flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors"
          >
            Skip tour
          </button>

          <div className="flex items-center space-x-3">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
            
            <button
              onClick={handleNext}
              className={`px-6 py-2 bg-gradient-to-r ${currentStepData.color} text-white rounded-lg hover:shadow-xl transition-all flex items-center space-x-2 font-semibold`}
            >
              <span>{isLastStep ? "Let's Go!" : 'Next'}</span>
              {isLastStep ? <Check className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;