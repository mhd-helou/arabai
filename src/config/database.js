const massive = require('massive');

let db = null;

const connectDB = async () => {
  try {
    if (db) {
      return db;
    }

    const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

    db = await massive({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    console.log('PostgreSQL connected successfully via Massive');
    return db;

  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
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

module.exports = {
  connectDB,
  getDB,
  closeDB
};