const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true },
  excerpt: { type: String, required: true, trim: true },
  content: { type: String, required: true },
  thumbnail: { type: String, trim: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }],
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  isFeatured: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

tipSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

tipSchema.index({ status: 1, createdAt: -1 });
tipSchema.index({ category: 1, status: 1 });
tipSchema.index({ tags: 1, status: 1 });

module.exports = mongoose.model('Tip', tipSchema);
