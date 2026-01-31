const mongoose = require('mongoose');
const SupportRequest = require('./SupportRequest');

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phone: { type: String, required: true, trim: true },
  deviceType: { type: String, enum: ['PC', 'Laptop'], required: true },
  os: { type: String, required: true, trim: true },
  urgency: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  location: { type: String, trim: true },
  preferredTime: { type: String, trim: true },
  description: { type: String, required: true },
  attachmentUrl: { type: String, trim: true },
  status: { type: String, enum: ['NEW', 'ACCEPTED', 'IN_PROGRESS', 'DONE', 'REJECTED'], default: 'NEW' },
  adminNotes: [{
    note: String,
    createdAt: { type: Date, default: Date.now }
  }]
});

ticketSchema.index({ user: 1, createdAt: -1 });
ticketSchema.index({ status: 1, createdAt: -1 });

module.exports = SupportRequest.discriminator('Ticket', ticketSchema, 'ticket');
