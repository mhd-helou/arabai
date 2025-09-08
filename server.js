// Load environment-specific .env file (only if not already set by Cloud Run)
if (!process.env.PORT && process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: '.env.production' });
} else if (!process.env.PORT) {
  require('dotenv').config(); // Uses .env by default for development
}
const createApp = require('./src/app');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('🔧 Starting server initialization...');
    console.log(`📍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📍 PORT: ${PORT}`);
    console.log(`📍 DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
    
    const app = await createApp();
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
    });

    // Graceful shutdown
    const gracefulShutdown = () => {
      console.log('\n🔄 Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};
startServer();// Auto-trigger test Tue Sep  9 00:23:30 WEST 2025
