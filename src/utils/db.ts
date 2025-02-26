import { MongoClient, Db } from 'mongodb';
import env from './env';

// MongoDB connection URL
const MONGODB_URI = env.MONGODB_URI || 'mongodb://localhost:27017/content-calendar';

// MongoDB client and database instance
let client: MongoClient | null = null;
let db: Db | null = null;

/**
 * Connect to MongoDB
 */
export const connectToDatabase = async (): Promise<{ client: MongoClient; db: Db }> => {
  // If we already have a connection, return it
  if (client && db) {
    return { client, db };
  }

  try {
    // Create a new client and connect
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    // Get database name from URI or use default
    const dbName = MONGODB_URI.split('/').pop()?.split('?')[0] || 'content-calendar';
    db = client.db(dbName);
    
    console.log('✅ Connected to MongoDB successfully');
    
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    
    // In production, fail fast. In development, continue with warnings
    if (env.NODE_ENV === 'production') {
      console.error('❌ MongoDB connection failed in production mode. Exiting.');
      process.exit(1);
    } else {
      console.warn('⚠️ MongoDB connection failed in development mode. Some features may not work properly.');
      // Return empty objects to avoid null checks (this is only for development)
      return { 
        client: client || new MongoClient(''), 
        db: db || client?.db('content-calendar') as Db 
      };
    }
  }
};

/**
 * Close the MongoDB connection
 */
export const closeDatabase = async (): Promise<void> => {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('✅ MongoDB connection closed');
  }
};

/**
 * Get the database instance
 */
export const getDb = async (): Promise<Db> => {
  if (!db) {
    const { db: database } = await connectToDatabase();
    db = database;
  }
  return db;
}; 