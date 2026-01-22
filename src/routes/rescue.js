const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { ensureAuth } = require('../middlewares/auth');

module.exports = (rescueLimiter) => {
  router.get('/', ticketController.intro);
  router.get('/new', ensureAuth, ticketController.newForm);
  router.post('/new', ensureAuth, rescueLimiter, ticketController.create);
  router.get('/my', ensureAuth, ticketController.myTickets);
  router.get('/:id', ensureAuth, ticketController.detail);
  return router;
};
