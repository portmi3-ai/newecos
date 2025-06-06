import mongoose from 'mongoose';

/**
 * Connect to MongoDB using the provided config
 * @param {object} config - The loaded configuration object
 */
export async function connectDB(config) {
  try {
    await mongoose.connect(config.database.uri, config.database.options);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
} 