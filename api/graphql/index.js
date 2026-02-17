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
    console.log('📊 Initializing database indexes...');
    await initializeIndexes(db);
    
    // Initialize OAuth strategies with database (optional)
    configureOAuth(db);
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
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
  console.log('🚀 Apollo Server started');

  // Apply CORS globally first - support multiple development ports
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, or server-to-server)
      if (!origin) return callback(null, true);
      
      console.log('🔍 CORS check for origin:', origin);
      console.log('🔍 Allowed origins:', CORS_ORIGIN);
      
      // If CORS_ORIGIN is an array, check if origin is in the list
      if (Array.isArray(CORS_ORIGIN)) {
        if (CORS_ORIGIN.includes(origin)) {
          console.log('✅ CORS allowed for origin:', origin);
          return callback(null, true);
        }
      } else if (CORS_ORIGIN === origin) {
        console.log('✅ CORS allowed for origin:', origin);
        return callback(null, true);
      }
      
      // Allow the request but log warning (don't block on production)
      console.log('⚠️ CORS origin not in whitelist, but allowing:', origin);
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Apollo-Require-Preflight'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }));

  // Explicit OPTIONS handler for preflight requests
  app.options('*', cors());

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
  
  console.log('');
  console.log('🎉 =============================================');
  console.log(`🚀 GraphQL API running at http://localhost:${PORT}/graphql`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
  console.log(`🎮 GraphQL Playground at http://localhost:${PORT}/graphql`);
  console.log('🎉 =============================================');
  console.log('');
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
