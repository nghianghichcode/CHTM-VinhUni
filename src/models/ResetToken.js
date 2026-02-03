const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  tokenHash: { type: String, required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

resetTokenSchema.index({ email: 1 });
resetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('ResetToken', resetTokenSchema);
