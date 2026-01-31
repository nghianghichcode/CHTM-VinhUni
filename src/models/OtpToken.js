const mongoose = require('mongoose');

const otpTokenSchema = new mongoose.Schema({
  email: { type: String, required: true, trim: true, lowercase: true },
  purpose: { type: String, enum: ['register', 'reset'], required: true },
  codeHash: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

otpTokenSchema.index({ email: 1, purpose: 1 });
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpToken', otpTokenSchema);
