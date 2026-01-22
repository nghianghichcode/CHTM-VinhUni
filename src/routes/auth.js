const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureGuest } = require('../middlewares/auth');

module.exports = (loginLimiter) => {
  router.get('/login', ensureGuest, authController.loginForm);
  router.post('/login', loginLimiter, ensureGuest, authController.login);
  router.get('/register', ensureGuest, authController.registerForm);
  router.post('/register', ensureGuest, authController.register);
  router.get('/logout', authController.logout);
  return router;
};
