const express = require('express');
const router = express.Router();
const { ensureAuth } = require('../middlewares/auth');
const Ticket = require('../models/Ticket');

router.get('/', ensureAuth, async (req, res) => {
  const tickets = await Ticket.find({ user: req.session.user._id }).sort({ createdAt: -1 });
  res.render('profile', { tickets });
});

module.exports = router;
