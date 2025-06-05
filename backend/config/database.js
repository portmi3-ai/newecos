import mongoose from 'mongoose';
import config from './environment.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.database.url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Log successful connection
    const logging = new Logging();
    const log = logging.log('agentEcos-api');
    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    
    const entry = log.entry(metadata, {
      message: 'MongoDB connection established',
      host: conn.connection.host,
      database: conn.connection.name,
      environment: config.server.env,
    });
    
    log.write(entry);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      const errorEntry = log.entry(metadata, {
        message: 'MongoDB connection error',
        error: err.message,
        stack: err.stack,
        environment: config.server.env,
      });
      log.write(errorEntry);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      const disconnectEntry = log.entry(metadata, {
        message: 'MongoDB disconnected',
        environment: config.server.env,
      });
      log.write(disconnectEntry);
    });

    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB; 