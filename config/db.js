const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ CRITICAL: MONGO_URI is not defined in environment variables!");
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000, // Timeout after 3s (v2)
    });
    console.log(`✅ MongoDB Connected (v2): ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error (v2): ${error.message}`);
    // Do not call process.exit(1) on Vercel as it kills the serverless function
  }
};

module.exports = connectDB;
