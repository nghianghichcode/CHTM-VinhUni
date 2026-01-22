const mongoose = require('mongoose');

module.exports = function connectDB() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI is not set. Skipping MongoDB connection.');
    return;
  }
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('MongoDB connected');
  }).catch(err => {
    console.error('MongoDB connection error:', err);
    if (!process.env.VERCEL) process.exit(1);
  });
};
