import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_AI_MESSAGES, GENERATE_AI_COACH_MESSAGE } from '../lib/graphql';
import { Sparkles, Loader2, Send, Bot, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * AI Coach Chat Interface
 * Personalized AI assistant for challenge suggestions and motivation
 */
const AICoach = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const { data, loading, refetch } = useQuery(GET_AI_MESSAGES, {
    variables: { limit: 50 },
    skip: !user,
    fetchPolicy: 'cache-and-network',
  });

  const [generateMessage] = useMutation(GENERATE_AI_COACH_MESSAGE, {
    onCompleted: (data) => {
      setMessages(prev => [...prev, {
        id: data.generateAICoachMessage.id,
        content: data.generateAICoachMessage.content,
        sender: 'ai',
        timestamp: new Date()
      }]);
      setIsTyping(false);
      refetch();
    },
    onError: (error) => {
      console.error('AI Coach error:', error);
      
      let userMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.message.includes('Rate limit exceeded') || error.message.includes('rate limit')) {
        userMessage = '⏱️ Rate Limit Reached\n\nPlease wait a moment and try again.\n\n💡 Tip: Cached responses are instant!';
      } else if (error.message.includes('quota')) {
        userMessage = '📊 Daily Quota Reached\n\nFree tier: 1,500 requests/day.\n\nTry again tomorrow or ask previously asked questions (cached).';
      }
      
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: userMessage,
        sender: 'ai',
        timestamp: new Date(),
        error: true
      }]);
      setIsTyping(false);
    }
  });

  useEffect(() => {
    if (data?.aiMessages) {
      const aiMessages = data.aiMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: 'ai',
        timestamp: new Date(msg.createdAt)
      }));
      setMessages(aiMessages);
    }
  }, [data]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const quickActions = [
    { icon: '💪', label: 'Get Motivation', prompt: 'Give me some motivation to keep going with my challenges!' },
    { icon: '📊', label: 'Progress Tips', prompt: 'How can I improve my check-in consistency and progress?' },
    { icon: '🎯', label: 'Challenge Ideas', prompt: 'Suggest some new challenges I could try based on my current ones' },
    { icon: '🔥', label: 'Streak Advice', prompt: 'Help me maintain and grow my streaks. What strategies work best?' },
    { icon: '👥', label: 'Partner Tips', prompt: 'How can I be a better streak partner to my friends?' },
    { icon: '⏰', label: 'Time Management', prompt: 'Help me find the best time to do my daily check-ins' },
  ];

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      id: Date.now(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      await generateMessage({ variables: { challengeId: null } });
    } catch (error) {
      console.error('Failed to generate AI message:', error);
    }
  };

  const handleQuickAction = async (action) => {
    setIsTyping(true);
    const userMessage = {
      id: Date.now(),
      content: action.prompt,
      sender: 'user',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // Special handling for Challenge Ideas
      if (action.label === 'Challenge Ideas') {
        // Generate AI response with specific context
        await generateMessage({ 
          variables: { 
            challengeId: null,
            prompt: `${action.prompt}\n\nPlease suggest 3-5 specific challenge ideas with:\n- Challenge name\n- Brief description (1-2 sentences)\n- Estimated duration\n- Why it's a good fit\n\nFormat each as a numbered list for easy reading.`
          } 
        });
      } else {
        await generateMessage({ variables: { challengeId: null } });
      }
    } catch (error) {
      console.error('Failed to generate AI message:', error);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
      <div className="h-[calc(100vh-120px)] sm:h-[calc(100vh-140px)] flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-teal-500 dark:from-cyan-600 dark:via-blue-600 dark:to-teal-600 text-white p-3 sm:p-4 lg:p-6 overflow-hidden shadow-lg flex-shrink-0">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-overlay filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="relative flex items-center space-x-3 sm:space-x-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/30 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Bot className="w-7 h-7 sm:w-9 sm:h-9 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">AI Coach</h1>
            <p className="text-white/90 mt-1 text-sm sm:text-base hidden sm:block">Your intelligent streak companion ✨</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 overflow-y-auto p-2 sm:p-4 lg:p-5 space-y-2 sm:space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-20 h-20 text-cyan-400 mx-auto mb-6 animate-pulse" />
            <h3 className="text-2xl font-bold mb-3 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              Welcome to AI Coach!
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
              Choose a topic to get started or ask your own question
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickAction(action)}
                  disabled={isTyping}
                  className="group relative p-6 bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-2xl text-left transition-all transform hover:scale-105 hover:shadow-2xl shadow-lg disabled:opacity-50"
                >
                  <div className="text-4xl mb-3">{action.icon}</div>
                  <p className="font-bold text-white text-lg mb-1">{action.label}</p>
                  <p className="text-sm text-cyan-100">{action.prompt.substring(0, 40)}...</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div className={`flex items-start space-x-3 max-w-2xl ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center shadow-lg ${
                    message.sender === 'user' 
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600' 
                      : 'bg-gradient-to-br from-teal-500 to-cyan-600'
                  }`}>
                    {message.sender === 'user' ? <User className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6 text-white" />}
                  </div>
                  
                  <div className={`px-5 py-4 rounded-2xl shadow-lg ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
                      : message.error
                      ? 'bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
                      : 'bg-white dark:bg-gray-800 border-2 border-cyan-100 dark:border-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${message.sender === 'user' ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start animate-fadeIn">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border-2 border-cyan-100 dark:border-gray-700 px-5 py-4 rounded-2xl shadow-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick Actions Bar - More Compact */}
      {messages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border-t border-cyan-100 dark:border-gray-700 px-2 py-1 sm:px-3 sm:py-1.5 flex-shrink-0">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1 flex-shrink-0 hidden sm:inline">Quick:</span>
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                disabled={isTyping}
                className="inline-flex items-center px-1.5 sm:px-2.5 py-1 bg-gradient-to-r from-cyan-100 to-blue-100 dark:from-cyan-900/30 dark:to-blue-900/30 hover:from-cyan-200 hover:to-blue-200 dark:hover:from-cyan-800/40 dark:hover:to-blue-800/40 text-cyan-700 dark:text-cyan-300 rounded-full text-xs font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex-shrink-0 whitespace-nowrap"
              >
                <span className="mr-1">{action.icon}</span>
                <span className="hidden lg:inline">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSendMessage} className="bg-white dark:bg-gray-800 border-t border-cyan-100 dark:border-gray-700 p-2 sm:p-3 lg:p-4 shadow-lg flex-shrink-0">
        <div className="flex space-x-2 sm:space-x-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 px-3 sm:px-5 py-2 sm:py-3 border-2 border-cyan-200 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-cyan-50/50 dark:bg-gray-700 placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg hover:shadow-xl font-medium flex-shrink-0"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center hidden sm:block">
          💡 Tip: Cached answers are instant!
        </p>
      </form>
    </div>
    </div>
  );
};

export default AICoach;
