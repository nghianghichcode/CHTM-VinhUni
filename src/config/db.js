const mongoose = require('mongoose');

module.exports = function connectDB() {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }).then(() => {
    console.log('MongoDB connected');
  }).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
};
