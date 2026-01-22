const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nSitemap: ${process.env.BASE_URL || 'http://localhost:3000'}/sitemap.xml\n`);
});

module.exports = router;
