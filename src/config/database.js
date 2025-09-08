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
      // Production: Check if we're in Cloud Run with Cloud SQL
      if (process.env.DB_SOCKET_PATH && process.env.DB_NAME) {
        // Cloud SQL Unix socket connection
        connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@/${process.env.DB_NAME}?host=${process.env.DB_SOCKET_PATH}`;
      } else {
        // Fallback to DATABASE_URL
        connectionString = process.env.DATABASE_URL;
      }
    } else {
      // Local development: Use DATABASE_URL from .env if available, otherwise build from parts
      connectionString = process.env.DATABASE_URL || 
        `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
    }

    console.log(`🔗 Connecting to database: ${connectionString?.replace(/:[^:@]*@/, ':****@')}`); // Hide password

    if (!connectionString) {
      throw new Error('Database connection string is required');
    }

    const massiveConfig = {
      connectionString,
      ssl: false, // Cloud SQL socket connections don't use SSL
    };

    db = await massive(massiveConfig);

    console.log('PostgreSQL connected successfully via Massive');
    return db;

  } catch (error) {
    console.error('Database connection error:', error.message);
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ Production database connection failed. Check DATABASE_URL environment variable.');
      console.error('Expected format: postgresql://user:password@host:port/database');
    }
    throw error; // Let the calling function decide what to do
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