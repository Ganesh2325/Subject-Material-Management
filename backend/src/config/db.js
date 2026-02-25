import mongoose from 'mongoose';

const connectDB = async (mongoUri) => {
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      dbName: process.env.MONGO_DB_NAME || 'acos_db'
    });

    // eslint-disable-next-line no-console
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

export default connectDB;

