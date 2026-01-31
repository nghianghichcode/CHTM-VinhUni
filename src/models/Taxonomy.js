const mongoose = require('mongoose');

const taxonomySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true }
  },
  {
    timestamps: true,
    collection: 'taxonomies',
    discriminatorKey: 'type'
  }
);

taxonomySchema.index({ slug: 1, type: 1 }, { unique: true });
taxonomySchema.index({ name: 1, type: 1 });

module.exports = mongoose.model('Taxonomy', taxonomySchema);
