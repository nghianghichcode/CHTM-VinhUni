const express = require('express');
const router = express.Router();
const Tip = require('../models/Tip');
const Category = require('../models/Category');
const Tag = require('../models/Tag');

router.get('/', async (req, res) => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const tips = await Tip.find({ status: 'published' });
  const categories = await Category.find();
  const tags = await Tag.find();
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${base}/</loc></url>\n  <url><loc>${base}/tips</loc></url>\n  ${tips.map(t => `<url><loc>${base}/tip/${t.slug}</loc></url>`).join('')}\n  ${categories.map(c => `<url><loc>${base}/category/${c.slug}</loc></url>`).join('')}\n  ${tags.map(tag => `<url><loc>${base}/tag/${tag.slug}</loc></url>`).join('')}\n</urlset>`);
});

module.exports = router;
