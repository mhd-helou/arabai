const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database');
const createAuthRoutes = require('./routes/auth.routes');
const createApp = async () => {
  const app = express();
  // Trust proxy for Cloud Run (more secure configuration)
  app.set('trust proxy', 1);
  // Connect to database (non-blocking for startup)
  let db = null;
  try {
    db = await connectDB();
    console.log('✅ Database connected successfully');
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    // In production, if DATABASE_URL is not properly configured, provide guidance
    if (process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL) {
      console.error('💡 DATABASE_URL environment variable is required in production');
      console.error('💡 Set it in Cloud Run environment variables');
    }
    console.warn('⚠️  Starting server without database connection. Some endpoints may not work.');
  }
  // Security middlewares
  app.use(helmet());
  // CORS configuration for development and production
  const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',')
    : [
        'http://localhost:3000',  // Frontend dev server
        'http://localhost:8080',  // Vue CLI default  
        'http://localhost:5173',  // Vite dev server
        'http://localhost:4173'   // Vite preview
      ];
  
  // Always allow localhost:3000 for development
  if (!allowedOrigins.includes('http://localhost:3000')) {
    allowedOrigins.push('http://localhost:3000');
  }

  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));
  // Global rate limiting
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: {
      success: false,
      message: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(globalLimiter);
  // Body parsing middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Cookie parsing middleware
  app.use(cookieParser());
  // Health check route
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  });
  // API routes
  if (db) {
    app.use('/api/auth', createAuthRoutes(db));
  } else {
    // If no database connection, return error for auth routes
    app.use('/api/auth', (req, res) => {
      res.status(503).json({
        success: false,
        message: 'Database connection unavailable. Please try again later.'
      });
    });
  }
  // Root API route
  app.get('/api', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Arab AI API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        health: '/health'
      }
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({
      success: false,
      message: 'Route not found'
    });
  });

  // Global error handler
  app.use((error, req, res, next) => {
    console.error('Global error:', error);
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON format'
      });
    }
    if (error.type === 'entity.too.large') {
      return res.status(413).json({
        success: false,
        message: 'Request payload too large'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  });

  return app;
};

module.exports = createApp;