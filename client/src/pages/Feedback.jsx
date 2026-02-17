import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, gql } from '@apollo/client';
import { MessageSquare, Send, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import Logo from '../components/common/Logo';

const SEND_FEEDBACK = gql`
  mutation SendFeedback($name: String!, $email: String!, $subject: String!, $message: String!) {
    sendFeedback(name: $name, email: $email, subject: $subject, message: $message) {
      success
      message
    }
  }
`;

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const [sendFeedback, { loading, error }] = useMutation(SEND_FEEDBACK, {
    onCompleted: (data) => {
      if (data.sendFeedback.success) {
        setSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }
    },
    onError: (err) => {
      console.error('Feedback submission error:', err);
    }
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await sendFeedback({
      variables: formData
    });
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your feedback has been successfully submitted. We appreciate you taking the time to help us improve nexLevel!
            </p>
            <div className="space-y-3">
              <Link 
                to="/"
                className="block w-full bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all"
              >
                Back to Home
              </Link>
              <button
                onClick={() => setSubmitted(false)}
                className="block w-full text-indigo-600 hover:text-indigo-700 font-semibold py-2"
              >
                Send Another Feedback
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <Logo variant="default" size="sm" />
          </Link>
          <Link 
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Feedback Form */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-cyan-600" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent mb-4">
              We'd Love Your Feedback
            </h1>
            <p className="text-gray-600 text-lg">
              Help us improve nexLevel by sharing your thoughts, suggestions, or reporting issues.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">
                {error.message || 'An error occurred while submitting your feedback. Please try again.'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="John Doe"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Feature request, bug report, general feedback..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                placeholder="Tell us what's on your mind..."
                required
              ></textarea>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-cyan-600 to-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-cyan-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Feedback
                  </>
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-gray-500 text-center">
            * Required fields. Your feedback helps us build a better experience for everyone.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
