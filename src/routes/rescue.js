const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { ensureAuth } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/asyncHandler');

module.exports = (rescueLimiter) => {
  router.get('/', ticketController.intro);
  router.get('/new', ensureAuth, ticketController.newForm);
  router.post('/new', ensureAuth, rescueLimiter, asyncHandler(ticketController.create));
  router.get('/my', ensureAuth, asyncHandler(ticketController.myTickets));
  router.get('/:id', ensureAuth, asyncHandler(ticketController.detail));
  return router;
};
