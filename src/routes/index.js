const express = require('express');
const createAuthRoutes = require('./auth.routes');

const createRoutes = (db) => {
  const router = express.Router();

  // Mount auth routes
  router.use('/auth', createAuthRoutes(db));

  // API info route
  router.get('/', (req, res) => {
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

  return router;
};

module.exports = createRoutes;