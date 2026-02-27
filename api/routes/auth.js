import express from 'express';
import passport from 'passport';
import { generateToken } from '../lib/auth.js';

const router = express.Router();

/**
 * OAuth Authentication Routes (Optional)
 * Only enabled if OAuth credentials are configured
 */

// Google OAuth (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_auth_failed' }),
    (req, res) => {
      // Generate JWT token
      const token = generateToken(req.user._id);
      
      // Redirect to frontend with token
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
  );

}

// GitHub OAuth (only if configured)
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  router.get('/github',
    passport.authenticate('github', { scope: ['user:email'] })
  );

  router.get('/github/callback',
    passport.authenticate('github', { session: false, failureRedirect: '/login?error=github_auth_failed' }),
    (req, res) => {
      // Generate JWT token
      const token = generateToken(req.user._id);
      
      // Redirect to frontend with token
      const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
    }
  );

}

// Apple Sign In (placeholder - requires Apple Developer account)
// router.get('/apple', ...);
// router.post('/apple/callback', ...);

export default router;
