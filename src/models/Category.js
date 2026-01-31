const mongoose = require('mongoose');
const Taxonomy = require('./Taxonomy');

const categorySchema = new mongoose.Schema({});

module.exports = Taxonomy.discriminator('Category', categorySchema, 'category');
