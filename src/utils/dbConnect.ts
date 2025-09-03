import mongoose from 'mongoose';

// Define connection interface for better type safety
interface MongoConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Cache the connection to avoid multiple connections in development
let cached: MongoConnection = (global as Record<string, unknown>).mongoose as MongoConnection;

if (!cached) {
  cached = (global as Record<string, unknown>).mongoose = {
    conn: null,
    promise: null,
  };
}

/**
 * Connect to MongoDB database
 * Uses connection caching to prevent multiple connections in development
 * @returns Promise<typeof mongoose> - The mongoose connection
 */
async function dbConnect(): Promise<typeof mongoose> {
  // Check if we already have a cached connection
  if (cached.conn) {
    console.log('🔄 Using cached MongoDB connection');
    return cached.conn;
  }

  // Validate that MONGO_URI is provided
  if (!process.env.MONGO_URI) {
    throw new Error(
      '❌ Please define the MONGO_URI environment variable inside .env.local'
    );
  }

  // If no cached promise exists, create a new connection
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    console.log('🔌 Connecting to MongoDB...');
    cached.promise = mongoose.connect(process.env.MONGO_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
    console.log('✅ MongoDB connected successfully');
    
    // Log connection details in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Connected to database: ${cached.conn.connection.name}`);
      console.log(`🌐 Host: ${cached.conn.connection.host}:${cached.conn.connection.port}`);
    }
    
    return cached.conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    
    // Reset the cached promise so we can try again
    cached.promise = null;
    
    throw new Error(`Failed to connect to MongoDB: ${error}`);
  }
}

/**
 * Disconnect from MongoDB database
 * Useful for cleanup in tests or when shutting down the application
 */
async function dbDisconnect(): Promise<void> {
  try {
    if (cached.conn) {
      await mongoose.disconnect();
      cached.conn = null;
      cached.promise = null;
      console.log('🔌 MongoDB disconnected successfully');
    }
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
    throw error;
  }
}

/**
 * Check if database is connected
 * @returns boolean - True if connected, false otherwise
 */
function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Get current connection state
 * @returns string - Current connection state
 */
function getConnectionState(): string {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  return states[mongoose.connection.readyState as keyof typeof states] || 'unknown';
}

/**
 * Wait for database connection to be ready
 * @param timeout - Maximum time to wait in milliseconds (default: 10000)
 * @returns Promise<void>
 */
async function waitForConnection(timeout: number = 10000): Promise<void> {
  const startTime = Date.now();
  
  while (!isConnected() && Date.now() - startTime < timeout) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  if (!isConnected()) {
    throw new Error(`Database connection timeout after ${timeout}ms`);
  }
}

// Event listeners for connection monitoring
mongoose.connection.on('connected', () => {
  console.log('🟢 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('🔴 Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🟡 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await dbDisconnect();
    console.log('👋 Database connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

export default dbConnect;
export { 
  dbConnect, 
  dbDisconnect, 
  isConnected, 
  getConnectionState, 
  waitForConnection 
};
