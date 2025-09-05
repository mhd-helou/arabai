const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB } = require('./config/database');
const createAuthRoutes = require('./routes/auth.routes');

const createApp = async () => {
  const app = express();

  // Connect to database
  const db = await connectDB();

  // Security middlewares
  app.use(helmet());
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

  // Health check route
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString()
    });
  });

  // API routes
  app.use('/api/auth', createAuthRoutes(db));
  
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