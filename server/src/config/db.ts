import mongoose from 'mongoose';

export let isMongoConnected = false;

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weather_db';
  
  try {
    // Set connect timeout to 3 seconds so server starts quickly even if local Mongo is not running
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 3000,
    });
    isMongoConnected = true;
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    isMongoConnected = false;
    console.warn('⚠️ MongoDB connection failed. Operating with in-memory fallback for Favorites store.');
  }
};
