import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { connectToDatabase, initializeIndexes } from '../lib/mongodb.js';
import { createContext } from './context.js';
import { resolvers } from './resolvers/index.js';
import passport from 'passport';
import { configureOAuth } from '../lib/oauth.js';
import authRoutes from '../routes/auth.js';

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read GraphQL schema
const typeDefs = readFileSync(join(__dirname, 'schema.graphql'), 'utf-8');

// Configuration
const PORT = process.env.PORT || 4000;

// Parse CORS_ORIGIN - can be comma-separated string or array
let CORS_ORIGIN;
if (process.env.CORS_ORIGIN) {
  // If it's a string with commas, split it into an array
  CORS_ORIGIN = process.env.CORS_ORIGIN.includes(',') 
    ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
    : process.env.CORS_ORIGIN;
} else {
  // Default development origins
  CORS_ORIGIN = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];
}

/**
 * CORS middleware for Vercel serverless functions
 */
function setCorsHeaders(req, res) {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Apollo-Require-Preflight');
}

/**
 * Initialize and start the GraphQL server
 */
async function startServer() {
  // Create Express app
  const app = express();
  const httpServer = http.createServer(app);

  // Handle CORS for all requests at the very beginning
  app.use((req, res, next) => {
    setCorsHeaders(req, res);
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    
    next();
  });

  // Connect to MongoDB and initialize indexes
  let db;
  try {
    const connection = await connectToDatabase();
    db = connection.db;

    await initializeIndexes(db);
    
    // Initialize OAuth strategies with database (optional)
    configureOAuth(db);
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Stack:', error.stack);
    
    // On Vercel, throw error to let the function fail gracefully
    if (process.env.VERCEL) {

      throw new Error(`Database connection failed: ${error.message}`);
    } else {
      process.exit(1);
    }
  }

  // Create Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true, // Enable GraphQL Playground
    formatError: (error) => {
      console.error('GraphQL Error:', error);
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
  });

  // Start Apollo Server
  await server.start();

  // Initialize passport
  app.use(passport.initialize());

  // Mount auth routes BEFORE GraphQL
  app.use('/auth', authRoutes);

  // Apply middleware
  app.use(
    '/graphql',
    express.json({ limit: '10mb' }), // Increase limit for base64 images
    expressMiddleware(server, {
      context: createContext,
    })
  );

  // Global error handler - ensure CORS headers on errors
  app.use((err, req, res, next) => {
    console.error('❌ Global error handler:', err);
    setCorsHeaders(req, res);
    res.status(500).json({
      errors: [{
        message: err.message || 'Internal server error',
        extensions: {
          code: 'INTERNAL_SERVER_ERROR'
        }
      }]
    });
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'nexlevel-api'
    });
  });

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'nexLevel API',
      graphql: '/graphql',
      health: '/health',
      version: '1.0.0'
    });
  });

  // Start HTTP server
  await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));







}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  // Don't exit on Vercel
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  // Don't exit on Vercel - let the function fail gracefully
  if (!process.env.VERCEL) {
    process.exit(1);
  }
});
