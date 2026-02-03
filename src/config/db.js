const mongoose = require('mongoose');
const { getMongoUri } = require('./mongoUri');

mongoose.set('bufferCommands', false);

let cached = global.__mongooseConn;
if (!cached) {
  cached = global.__mongooseConn = { conn: null, promise: null };
}

function readNumberEnv(value, fallback) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
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
    const isVercel = !!process.env.VERCEL;
    const defaultTimeout = readNumberEnv(process.env.MONGODB_TIMEOUT_MS, isVercel ? 5000 : 20000);
    const serverSelectionTimeoutMS = readNumberEnv(
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
      defaultTimeout
    );
    const connectTimeoutMS = readNumberEnv(
      process.env.MONGODB_CONNECT_TIMEOUT_MS,
      defaultTimeout
    );
    const socketTimeoutMS = readNumberEnv(
      process.env.MONGODB_SOCKET_TIMEOUT_MS,
      defaultTimeout
    );
    const retries = readNumberEnv(process.env.MONGODB_CONNECT_RETRIES, isVercel ? 0 : 1);
    const target = getMongoTarget(mongoUri);
    console.log('MongoDB connect target:', target);
    cached.promise = connectWithRetry(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS,
      connectTimeoutMS,
      socketTimeoutMS,
      maxPoolSize: 10
    }, retries).then((mongooseInstance) => {
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
