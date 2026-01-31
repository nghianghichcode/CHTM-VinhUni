const mongoose = require('mongoose');

const supportRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true }
  },
  {
    timestamps: true,
    collection: 'support_requests',
    discriminatorKey: 'type'
  }
);

supportRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('SupportRequest', supportRequestSchema);
