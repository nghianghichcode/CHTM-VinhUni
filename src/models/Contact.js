const mongoose = require('mongoose');
const SupportRequest = require('./SupportRequest');

const contactSchema = new mongoose.Schema({
  message: { type: String, required: true, trim: true }
});

module.exports = SupportRequest.discriminator('Contact', contactSchema, 'contact');
