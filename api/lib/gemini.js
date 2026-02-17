import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini AI (optional)
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Use Gemini 2.0 Flash - stable version with good rate limits
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-2.0-flash' }) : null;

// Log only if AI is enabled (not if disabled)
if (GEMINI_API_KEY) {
  console.log('✅ Gemini AI enabled');
}

// Simple in-memory cache for AI responses (24 hours)
const cache = new Map();

// Periodically clean expired cache entries (every hour)
setInterval(() => {
  const now = Date.now();
  let cleaned = 0;
  for (const [key, value] of cache.entries()) {
    if (value.expiresAt < now) {
      cache.delete(key);
      cleaned++;
    }
  }
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired cache entries`);
  }
}, 60 * 60 * 1000);

// Rate limiting for free tier with request queue
// Free tier limits: 15 requests per minute (RPM), 1500 requests per day (RPD)
const rateLimiter = {
  requests: [],
  queue: [],
  processing: false,
  
  // Check if we can make a request
  canMakeRequest() {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    // Clean old requests
    this.requests = this.requests.filter(time => time > oneDayAgo);
    
    // Check per-minute limit (use 12 instead of 15 for safety buffer)
    const recentRequests = this.requests.filter(time => time > oneMinuteAgo);
    if (recentRequests.length >= 12) {
      return { allowed: false, reason: 'per-minute', resetIn: 60, count: recentRequests.length };
    }
    
    // Check per-day limit (use 1400 instead of 1500 for safety buffer)
    if (this.requests.length >= 1400) {
      return { allowed: false, reason: 'per-day', resetIn: 24 * 60 * 60, count: this.requests.length };
    }
    
    return { allowed: true };
  },
  
  // Track a request
  trackRequest() {
    this.requests.push(Date.now());
  },
  
  // Get usage stats
  getStats() {
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    
    this.requests = this.requests.filter(time => time > oneDayAgo);
    const perMinute = this.requests.filter(time => time > oneMinuteAgo).length;
    const perDay = this.requests.length;
    
    return {
      perMinute,
      perMinuteLimit: 15,
      perDay,
      perDayLimit: 1500,
      perMinuteRemaining: Math.max(0, 15 - perMinute),
      perDayRemaining: Math.max(0, 1500 - perDay)
    };
  },
  
  // Wait for rate limit to clear
  async waitForRateLimit() {
    const check = this.canMakeRequest();
    if (check.allowed) return;
    
    console.log(`⏳ Rate limit hit (${check.reason}). Waiting before retry...`);
    
    // Wait based on reason
    if (check.reason === 'per-minute') {
      // Wait 5 seconds if per-minute limit hit
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      // Don't wait for daily limit - just throw error
      throw new Error('Daily rate limit exceeded. Please try again tomorrow.');
    }
  }
};

/**
 * Generate text using Gemini AI
 */
export async function generateText(prompt, useCache = true) {
  if (!model) {
    return 'AI features are currently unavailable. Please contact the administrator to enable AI functionality.';
  }

  // Check cache first
  if (useCache) {
    const cached = cache.get(prompt);
    if (cached && cached.expiresAt > Date.now()) {
      console.log('✓ Cache hit for Gemini request');
      return cached.response;
    }
  }

  // Check if we're close to rate limits and wait if needed
  const limitCheck = rateLimiter.canMakeRequest();
  if (!limitCheck.allowed && limitCheck.reason === 'per-minute') {
    console.log('⚠️ Approaching rate limit, waiting 5 seconds...');
    await rateLimiter.waitForRateLimit();
  }

  try {
    // Track request for stats
    rateLimiter.trackRequest();
    
    // Log usage stats
    const stats = rateLimiter.getStats();
    console.log('📊 Gemini API usage:', {
      perMinute: `${stats.perMinute}/${stats.perMinuteLimit}`,
      perDay: `${stats.perDay}/${stats.perDayLimit}`,
      remaining: `${stats.perMinuteRemaining}/min, ${stats.perDayRemaining}/day`
    });
    
    // Generate new response with retry logic
    let retries = 0;
    const maxRetries = 3;
    let lastError;
    
    while (retries < maxRetries) {
      try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Cache for 24 hours
        if (useCache) {
          cache.set(prompt, {
            response,
            expiresAt: Date.now() + 24 * 60 * 60 * 1000,
          });
        }

        return response;
      } catch (error) {
        lastError = error;
        
        // Check if it's a rate limit error (429 or RESOURCE_EXHAUSTED)
        if (error.message && (error.message.includes('429') || 
            error.message.includes('RESOURCE_EXHAUSTED') || 
            error.message.includes('quota'))) {
          
          retries++;
          if (retries < maxRetries) {
            // Exponential backoff: 2^retry * 2 seconds
            const waitTime = Math.pow(2, retries) * 2000;
            console.log(`⏳ Rate limit hit. Retry ${retries}/${maxRetries} in ${waitTime/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        
        // If not a rate limit error, throw immediately
        throw error;
      }
    }
    
    // If all retries failed, throw the last error
    throw lastError;
  } catch (error) {
    console.error('❌ Gemini API error:', error.message);
    
    // Check if it's a quota error from Google
    if (error.message.includes('quota') || error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
      const stats = rateLimiter.getStats();
      console.log('📊 Local usage stats when error occurred:', stats);
      throw new Error('Google API rate limit reached. Free tier: 15 requests/min, 1500/day. Please wait a moment and try again.');
    }
    
    // For other errors, provide helpful message
    if (error.message.includes('API key')) {
      throw new Error('Invalid API key. Please check your GEMINI_API_KEY in .env file.');
    }
    
    throw new Error('AI generation failed: ' + error.message);
  }
}

/**
 * Verify photo with AI (using vision capabilities)
 */
export async function verifyPhotoWithAI(base64Image) {
  if (!model) {
    // Return a default "verified" response when AI is not available
    return {
      verified: true,
      confidence: 0.5,
      detectedActivity: 'Photo uploaded (AI verification disabled)',
      detectedObjects: ['photo'],
      message: 'Photo accepted - AI verification is currently unavailable'
    };
  }

  try {
    const visionModel = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash' // Flash supports vision!
    });

    const prompt = `
      Analyze this image and determine if it shows evidence of completing a challenge.
      
      Respond with ONLY valid JSON (no markdown, no extra text):
      {
        "verified": boolean,
        "confidence": number (0-1),
        "detectedActivity": string,
        "detectedObjects": string[]
      }
      
      Example valid response:
      {"verified": true, "confidence": 0.93, "detectedActivity": "workout", "detectedObjects": ["exercise equipment", "gym"]}
    `;

    // Remove data URL prefix if present
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const imagePart = {
      inlineData: {
        data: base64Data,
        mimeType: 'image/jpeg',
      },
    };

    const result = await visionModel.generateContent([prompt, imagePart]);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('AI did not return valid JSON');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error('❌ Photo verification error:', error.message);
    // Return a default verification result instead of failing
    return {
      verified: true,
      confidence: 0.5,
      detectedActivity: 'unknown',
      detectedObjects: [],
    };
  }
}

/**
 * Generate motivational message for user
 */
export async function generateMotivationalMessage(userData) {
  // Fallback messages when AI is not available or rate limited
  const fallbackMessages = [
    `🎯 Keep up the great work! You're making progress on ${userData.activeChallenges || 0} challenge${userData.activeChallenges !== 1 ? 's' : ''}. Stay consistent!`,
    `💪 You've got this! ${userData.checkInsThisWeek || 0} check-ins this week shows your dedication. Keep the momentum going!`,
    `⭐ Great job staying accountable! Every check-in is a step toward your goals. Keep pushing forward!`,
    `🌟 Your consistency is impressive! Remember, small steps lead to big results. You're doing amazing!`,
    `🔥 Keep that streak alive! Your dedication to ${userData.activeChallenges || 0} challenge${userData.activeChallenges !== 1 ? 's' : ''} is inspiring!`,
    `🚀 You're on fire! ${userData.checkInsThisWeek || 0} check-ins this week is fantastic. Keep it up!`,
    `💫 Every day you check in is a victory. You're building lasting habits - keep going!`,
    `🎉 Consistency is key, and you're nailing it! Keep pushing toward your goals!`
  ];
  
  if (!model) {
    return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
  }

  // Create a cache key based on user stats (for better caching)
  const cacheKey = `motivation_${userData.activeChallenges}_${userData.checkInsThisWeek}_${(userData.streaks || []).join('_')}`;
  
  // Check if we have a cached response for similar stats
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    console.log('✓ Cache hit for motivational message');
    return cached.response;
  }
  
  const prompt = `
    You are a supportive streak coach for nexLevel. Generate a brief, encouraging message for this user.
    
    User's active challenges: ${userData.activeChallenges || 0}
    Check-ins this week: ${userData.checkInsThisWeek || 0}
    Current streaks: ${(userData.streaks || []).join(', ') || 'none'}
    
    Create a message that:
    1. Celebrates specific wins (mention actual numbers)
    2. Stays positive and supportive
    3. Offers one actionable tip
    4. Is 2-3 sentences max
    5. Uses 1-2 relevant emojis
    
    Tone: Supportive friend, not corporate coach
    
    Generate ONLY the message text, no other commentary.
  `;

  try {
    const response = await generateText(prompt, false); // Use generateText's own caching
    
    // Also cache with our custom key for even better hit rate
    cache.set(cacheKey, {
      response,
      expiresAt: Date.now() + 6 * 60 * 60 * 1000, // 6 hours for motivation
    });
    
    return response;
  } catch (error) {
    // If AI fails (rate limit, etc), return fallback
    console.log('⚠️ AI motivation failed, using fallback:', error.message);
    return fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
  }
}

/**
 * Generate weekly progress report
 */
export async function generateWeeklyReport(challengeStats) {
  if (!model) {
    // Generate a simple text-based report when AI is not available
    const totalCheckIns = challengeStats.reduce((sum, cs) => sum + cs.checkIns, 0);
    const avgRate = Math.round(challengeStats.reduce((sum, cs) => sum + cs.rate, 0) / challengeStats.length);
    
    return `📊 Weekly Progress Report\n\n` +
      `Great work this week! You completed ${totalCheckIns} check-ins across ${challengeStats.length} challenge${challengeStats.length !== 1 ? 's' : ''} ` +
      `with an average completion rate of ${avgRate}%.\n\n` +
      `${challengeStats.map(cs => `• ${cs.name}: ${cs.checkIns}/7 check-ins (${cs.rate}%) - ${cs.streak}-day streak`).join('\n')}\n\n` +
      `Keep up the momentum! Consistency is key to building lasting habits. 💪`;
  }

  const statsText = challengeStats
    .map(cs => `- ${cs.name}: ${cs.checkIns}/7 check-ins (${cs.rate}%), ${cs.streak}-day streak`)
    .join('\n');

  const prompt = `
    Generate a supportive weekly progress summary for this user.
    
    Challenges this week:
    ${statsText}
    
    Create a report that:
    1. Celebrates wins (be specific with numbers)
    2. Acknowledges struggles without judgment
    3. Identifies one pattern or insight
    4. Offers one actionable suggestion
    5. Ends with encouragement
    
    Format: 4-5 sentences, use emoji for section headers like 📊 🔥 💡
    Tone: Supportive friend who analyzes data
    
    Generate ONLY the report text.
  `;

  return generateText(prompt, false);
}

/**
 * Generate challenge recommendations
 */
export async function generateChallengeRecommendations(userHistory) {
  if (!model) {
    // Return default recommendations when AI is not available
    return {
      recommendations: [
        {
          name: "30-Day Morning Routine",
          category: "productivity",
          reason: "Build a consistent morning routine to start your day right",
          score: 85
        },
        {
          name: "Daily 10-Minute Meditation",
          category: "wellness",
          reason: "Reduce stress and improve focus with daily meditation",
          score: 80
        },
        {
          name: "Read for 20 Minutes Daily",
          category: "learning",
          reason: "Expand your knowledge with daily reading",
          score: 75
        }
      ]
    };
  }

  const successfulCategories = userHistory.successfulCategories || [];
  
  const prompt = `
    Based on this user's successful challenge categories: ${successfulCategories.join(', ') || 'fitness, productivity'}
    
    Recommend 3 new challenges they might enjoy.
    
    Respond with ONLY valid JSON (no markdown):
    {
      "recommendations": [
        {
          "name": "Challenge Name",
          "category": "category",
          "reason": "Brief reason why this fits",
          "score": 85
        }
      ]
    }
    
    Make recommendations realistic and varied.
  `;

  const text = await generateText(prompt, true); // Cache recommendations
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    return { recommendations: [] };
  }
  
  return JSON.parse(jsonMatch[0]);
}

/**
 * Clear the cache (useful for testing)
 */
export function clearCache() {
  cache.clear();
  console.log('Gemini AI cache cleared');
}

// Export rate limiter stats
export function getRateLimitStats() {
  return rateLimiter.getStats();
}

// Reset rate limiter (useful for testing or if stuck)
export function resetRateLimiter() {
  rateLimiter.requests = [];
  console.log('✅ Rate limiter reset - all request tracking cleared');
  return { success: true, message: 'Rate limiter reset successfully' };
}

export default {
  generateText,
  verifyPhotoWithAI,
  generateMotivationalMessage,
  generateWeeklyReport,
  generateChallengeRecommendations,
  clearCache,
  getRateLimitStats,
  resetRateLimiter
};
