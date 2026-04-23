const mongoose = require('mongoose');

const rescueRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    issue: { type: String, required: true, trim: true }
  },
  {
    timestamps: true,
    collection: 'rescue_requests'
  }
);

rescueRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model('RescueRequest', rescueRequestSchema);
