import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Target, Zap, Users, TrendingUp, CheckCircle, Sparkles, Brain, Award, Calendar } from 'lucide-react';
import Logo from '../components/common/Logo';

/**
 * Landing Page Component for nexLevel
 * Modern, engaging landing page with hero section, features, and CTA
 */
const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Logo variant="flame" size="sm" showText={true} />
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Log In
              </Link>
              <Link 
                to="/signup" 
                className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:from-cyan-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            <span>AI-Powered Goal Achievement</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Take Your Goals to the
            <br />
            <span className="bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600 bg-clip-text text-transparent">
              Next Level
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
            Build unstoppable streaks, stay motivated with AI coaching, and achieve your goals with intelligent tracking and social accountability.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/signup"
              className="group bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-cyan-700 hover:to-teal-700 transition-all shadow-xl hover:shadow-2xl flex items-center gap-2"
            >
              Start Free Today
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login"
              className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-semibold text-lg border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 transition-all shadow-lg hover:shadow-xl"
            >
              Log In
            </Link>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to help you build lasting habits and achieve your goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-500 transition-all hover:shadow-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">AI-Powered Coach</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Get personalized insights, motivation, and guidance from our intelligent AI coach that learns your habits.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-transparent hover:border-cyan-500 dark:hover:border-cyan-500 transition-all hover:shadow-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Streak Tracking</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Build momentum with visual streak tracking. See your progress grow day by day and stay motivated.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group bg-gradient-to-br from-teal-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-transparent hover:border-teal-500 dark:hover:border-teal-500 transition-all hover:shadow-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Social Accountability</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Partner with friends and join challenges together. Accountability makes goals achievable.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group bg-gradient-to-br from-green-50 to-teal-50 dark:from-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-transparent hover:border-green-500 dark:hover:border-green-500 transition-all hover:shadow-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Progress Analytics</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Beautiful visualizations and insights help you understand your patterns and improve.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-transparent hover:border-yellow-500 dark:hover:border-yellow-500 transition-all hover:shadow-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Achievement System</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Earn badges, unlock milestones, and celebrate every win on your journey to success.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 p-8 rounded-2xl border-2 border-transparent hover:border-cyan-500 dark:hover:border-cyan-500 transition-all hover:shadow-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Smart Reminders</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Never miss a check-in with intelligent reminders that adapt to your schedule.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">1</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Set Your Goals</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create personalized challenges that match your ambitions. Choose from popular challenges or create your own.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-4">2</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Track Progress</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Check in daily, build your streak, and watch your progress grow. Our AI coach provides encouragement along the way.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-4xl font-bold text-teal-600 dark:text-teal-400 mb-4">3</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Achieve Success</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Celebrate your wins, earn achievements, and inspire others. Your success story starts here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cyan-600 via-blue-600 to-teal-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Level Up?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of users who are achieving their goals with nexLevel. Start your journey today - it's free!
          </p>
          <Link 
            to="/signup"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl group"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Logo variant="flame" size="sm" showText={true} />
          </div>
          <p className="mb-4">
            Take your goals to the next level with AI-powered challenge tracking.
          </p>
          <div className="flex justify-center gap-6 mb-6">
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
            <Link to="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            <Link to="/feedback" className="hover:text-white transition-colors">Feedback</Link>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} nexLevel. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
