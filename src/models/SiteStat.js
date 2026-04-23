const mongoose = require('mongoose');

const siteStatSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('SiteStat', siteStatSchema);
