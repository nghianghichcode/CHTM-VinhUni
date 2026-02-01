const mongoose = require('mongoose');
const { getMongoUri } = require('./mongoUri');

mongoose.set('bufferCommands', false);

let cached = global.__mongooseConn;
if (!cached) {
  cached = global.__mongooseConn = { conn: null, promise: null };
}

module.exports = async function connectDB() {
  const mongoUri = getMongoUri();
  if (!mongoUri) {
    console.warn('MONGODB_URI is not set or uses placeholders. Skipping MongoDB connection.');
    return null;
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 8000
    }).then((mongooseInstance) => {
      console.log('MongoDB connected');
      return mongooseInstance;
    }).catch(err => {
      console.error('MongoDB connection error:', err);
      if (!process.env.VERCEL) process.exit(1);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};