const mongoose = require('mongoose');
const Taxonomy = require('./Taxonomy');

const tagSchema = new mongoose.Schema({});

module.exports = Taxonomy.discriminator('Tag', tagSchema, 'tag');
