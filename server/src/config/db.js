const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nageswarreddy-plants';
    console.log(`Connecting to MongoDB...`);
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Warning]: ${error.message}`);
    console.log('Ensure MongoDB Atlas URI or local MongoDB is running.');
  }
};

module.exports = connectDB;
