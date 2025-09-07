const massive = require('massive');

let db = null;

const connectDB = async () => {
  try {
    if (db) {
      return db;
    }

    // Build connection string based on environment
    let connectionString;

    if (process.env.NODE_ENV === 'production') {
      // Production: Use DATABASE_URL from .env.production or Netlify env vars
      connectionString = process.env.DATABASE_URL;
    } else {
      // Local development: Use DATABASE_URL from .env if available, otherwise build from parts
      connectionString = process.env.DATABASE_URL ||
          `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    }

    const massiveConfig = {
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    };

    // For serverless environments (like Netlify Functions), add connection pooling options
    if (process.env.NODE_ENV === 'production') {
      massiveConfig.poolSize = 10; // Smaller pool for serverless
      massiveConfig.poolIdleTimeout = 30000; // 30 seconds
      massiveConfig.poolLogLevel = 'error'; // Reduce logging noise
    }

    db = await massive(massiveConfig);

    console.log(`PostgreSQL connected successfully via Massive (${process.env.NODE_ENV || 'development'})`);
    return db;

  } catch (error) {
    console.error('Database connection error:', error);
    // In serverless environments, don't exit the process
    if (process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      process.exit(1);
    }
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return db;
};

const closeDB = async () => {
  if (db) {
    await db.pgp.end();
    db = null;
    console.log('Database connection closed');
  }
};

// For serverless environments, ensure connection is established
const ensureConnection = async () => {
  if (!db) {
    await connectDB();
  }
  return db;
};

module.exports = {
  connectDB,
  getDB,
  closeDB,
  ensureConnection // New helper for serverless
};