const mongoose = require('mongoose');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bitesync';
    
    // Attempt standard connection first with a 3-second timeout
    console.log(`Connecting to MongoDB at ${mongoUri.replace(/:[^:]*@/, ':****@')}...`);
    
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      console.log('MongoDB Connected successfully to remote/local instance');
      return;
    } catch (localError) {
      console.warn('Standard MongoDB connection failed or timed out:', localError.message);
      
      // Fallback to MongoMemoryServer for zero-config development/demo
      console.log('Spinning up embedded MongoDB Memory Server for seamless zero-config operation...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongoMemoryServer = await MongoMemoryServer.create();
        const memoryUri = mongoMemoryServer.getUri();
        await mongoose.connect(memoryUri);
        console.log(`MongoDB Connected successfully to in-memory instance: ${memoryUri}`);
      } catch (memError) {
        console.error('Failed to start in-memory MongoDB:', memError.message);
        throw localError; // Re-throw original error
      }
    }
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
  } catch (err) {
    console.error('Error disconnecting MongoDB:', err);
  }
};

module.exports = { connectDB, disconnectDB };
