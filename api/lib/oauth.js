import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { ObjectId } from 'mongodb';

/**
 * OAuth 2.0 Configuration for Social Authentication
 * Supports Google, GitHub, and Apple Sign-In
 */

// Initialize passport strategies
export function configureOAuth(db) {
  let strategiesConfigured = 0;
  
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const displayName = profile.displayName;
        const profilePhoto = profile.photos[0]?.value;

        // Find or create user
        let user = await db.collection('users').findOne({ email });

        if (!user) {
          // Create new user
          const newUser = {
            email,
            passwordHash: null, // OAuth users don't have passwords
            displayName,
            profilePhoto,
            oauthProvider: 'google',
            oauthId: profile.id,
            emailConfig: {
              gmailUser: null,
              gmailAppPassword: null,
              enabled: false
            },
            settings: {
              notifications: {
                enabled: true,
                quietHours: { start: '22:00', end: '07:00' },
                types: {
                  partnerComplete: true,
                  dailyReminder: true,
                  streakMilestone: true
                }
              },
              ai: {
                coachEnabled: true,
                photoVerification: true,
                recommendations: true,
                weeklyReports: true
              }
            },
            friendIds: [],
            friendRequests: { sent: [], received: [] },
            stats: {
              totalChallenges: 0,
              activeChallenges: 0,
              completedChallenges: 0,
              totalCheckIns: 0,
              longestStreak: 0
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date()
          };

          const result = await db.collection('users').insertOne(newUser);
          user = { ...newUser, _id: result.insertedId };
          console.log('✅ New Google OAuth user created:', email);
        } else {
          // Initialize emailConfig if not present (for existing users)
          if (!user.emailConfig) {
            await db.collection('users').updateOne(
              { _id: user._id },
              { 
                $set: { 
                  emailConfig: {
                    gmailUser: null,
                    gmailAppPassword: null,
                    enabled: false
                  },
                  lastLoginAt: new Date()
                }
              }
            );
          } else {
            // Update last login
            await db.collection('users').updateOne(
              { _id: user._id },
              { $set: { lastLoginAt: new Date() } }
            );
          }
          console.log('✅ Google OAuth user logged in:', email);
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
    strategiesConfigured++;
    console.log('✅ Google OAuth strategy configured');
  }

  // GitHub OAuth Strategy
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || '/auth/github/callback',
      scope: ['user:email']
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const displayName = profile.displayName || profile.username;
        const profilePhoto = profile.photos[0]?.value;

        // Find or create user
        let user = await db.collection('users').findOne({ email });

        if (!user) {
          // Create new user
          const newUser = {
            email,
            passwordHash: null,
            displayName,
            profilePhoto,
            oauthProvider: 'github',
            oauthId: profile.id,
            emailConfig: {
              gmailUser: null,
              gmailAppPassword: null,
              enabled: false
            },
            settings: {
              notifications: {
                enabled: true,
                quietHours: { start: '22:00', end: '07:00' },
                types: {
                  partnerComplete: true,
                  dailyReminder: true,
                  streakMilestone: true
                }
              },
              ai: {
                coachEnabled: true,
                photoVerification: true,
                recommendations: true,
                weeklyReports: true
              }
            },
            friendIds: [],
            friendRequests: { sent: [], received: [] },
            stats: {
              totalChallenges: 0,
              activeChallenges: 0,
              completedChallenges: 0,
              totalCheckIns: 0,
              longestStreak: 0
            },
            createdAt: new Date(),
            updatedAt: new Date(),
            lastLoginAt: new Date()
          };

          const result = await db.collection('users').insertOne(newUser);
          user = { ...newUser, _id: result.insertedId };
          console.log('✅ New GitHub OAuth user created:', email);
        } else {
          // Initialize emailConfig if not present (for existing users)
          if (!user.emailConfig) {
            await db.collection('users').updateOne(
              { _id: user._id },
              { 
                $set: { 
                  emailConfig: {
                    gmailUser: null,
                    gmailAppPassword: null,
                    enabled: false
                  },
                  lastLoginAt: new Date()
                }
              }
            );
          } else {
            // Update last login
            await db.collection('users').updateOne(
              { _id: user._id },
              { $set: { lastLoginAt: new Date() } }
            );
          }
          console.log('✅ GitHub OAuth user logged in:', email);
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));
    strategiesConfigured++;
    console.log('✅ GitHub OAuth strategy configured');
  }

  // OAuth is completely optional - no warnings needed
  if (strategiesConfigured > 0) {
    console.log(`✅ OAuth enabled with ${strategiesConfigured} provider(s)`);
  }

  // Apple Sign In would require different setup (Sign in with Apple uses OIDC)
  // Note: Apple Sign In requires a paid Apple Developer account
  // Implementation would use passport-apple or similar strategy

  passport.serializeUser((user, done) => {
    done(null, user._id.toString());
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await db.collection('users').findOne({ _id: new ObjectId(id) });
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
}

export default { configureOAuth };
