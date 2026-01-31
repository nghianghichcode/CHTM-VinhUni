const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureGuest } = require('../middlewares/auth');

module.exports = (loginLimiter, otpLimiter) => {
  router.get('/login', ensureGuest, authController.loginForm);
  router.post('/login', loginLimiter, ensureGuest, authController.login);
  router.get('/register', ensureGuest, authController.registerForm);
  router.post('/register', otpLimiter, ensureGuest, authController.register);
  router.get('/forgot', ensureGuest, authController.forgotForm);
  router.post('/forgot', otpLimiter, ensureGuest, authController.forgot);
  router.get('/verify-otp', ensureGuest, authController.verifyOtpForm);
  router.post('/verify-otp', otpLimiter, ensureGuest, authController.verifyOtp);
  router.get('/reset-password', ensureGuest, authController.resetPasswordForm);
  router.post('/reset-password', ensureGuest, authController.resetPassword);
  router.get('/logout', authController.logout);
  return router;
};
