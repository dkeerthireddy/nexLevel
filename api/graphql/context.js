import { connectToDatabase } from '../lib/mongodb.js';
import { getUserFromToken, extractToken } from '../lib/auth.js';

/**
 * Create GraphQL context for each request
 * Contains database connection and authenticated user
 */
export async function createContext({ req }) {
  // Connect to database
  const { db } = await connectToDatabase();
  
  // Extract token from Authorization header
  const authHeader = req.headers.authorization || '';
  const token = extractToken(authHeader);
  
  // Get user from token if present
  let user = null;
  if (token) {
    try {
      user = await getUserFromToken(token, db);
    } catch (error) {
      // Invalid token - user remains null

    }
  }
  
  return {
    db,
    user,
  };
}

export default createContext;
