const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
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
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ticketSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Ticket', ticketSchema);
