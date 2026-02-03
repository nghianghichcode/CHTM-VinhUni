const mongoose = require('mongoose');
const { getMongoUri } = require('./mongoUri');

mongoose.set('bufferCommands', false);

let cached = global.__mongooseConn;
if (!cached) {
  cached = global.__mongooseConn = { conn: null, promise: null };
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getMongoTarget(uri) {
  try {
    const parsed = new URL(uri);
    const host = parsed.host;
    const db = (parsed.pathname || '').replace(/^\//, '') || '(none)';
    return { host, db };
  } catch (err) {
    const match = uri.match(/mongodb\+srv:\/\/(?:[^@]+@)?([^/]+)\/([^?]+)/i);
    if (!match) return { host: '(unknown)', db: '(unknown)' };
    return { host: match[1], db: match[2] };
  }
}

async function connectWithRetry(uri, options, retries) {
  try {
    return await mongoose.connect(uri, options);
  } catch (err) {
    if (retries > 0) {
      console.warn('MongoDB connect failed, retrying...', err.code || err.name);
      await delay(800);
      return connectWithRetry(uri, options, retries - 1);
    }
    throw err;
  }
}

module.exports = async function connectDB() {
  const mongoUri = getMongoUri();
  if (!mongoUri) {
    console.warn('MONGODB_URI is not set or uses placeholders. Skipping MongoDB connection.');
    return null;
  }
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const target = getMongoTarget(mongoUri);
    console.log('MongoDB connect target:', target);
    cached.promise = connectWithRetry(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 20000,
      connectTimeoutMS: 20000,
      socketTimeoutMS: 20000,
      maxPoolSize: 10
    }, 1).then((mongooseInstance) => {
      console.log('MongoDB connected');
      return mongooseInstance;
    }).catch(err => {
      console.error('MongoDB connection error:', err);
      cached.promise = null;
      if (!process.env.VERCEL) process.exit(1);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
