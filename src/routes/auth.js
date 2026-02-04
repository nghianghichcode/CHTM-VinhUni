const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { ensureGuest } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/asyncHandler');

module.exports = (loginLimiter, otpLimiter) => {
  router.get('/login', ensureGuest, authController.loginForm);
  router.post('/login', loginLimiter, ensureGuest, asyncHandler(authController.login));
  router.get('/register', ensureGuest, authController.registerForm);
  router.post('/register', otpLimiter, ensureGuest, asyncHandler(authController.register));
  router.get('/forgot', ensureGuest, authController.forgotForm);
  router.post('/forgot', otpLimiter, ensureGuest, asyncHandler(authController.forgot));
  router.get('/resend-otp', otpLimiter, ensureGuest, asyncHandler(authController.resendOtp));
  router.get('/verify-otp', ensureGuest, authController.verifyOtpForm);
  router.post('/verify-otp', otpLimiter, ensureGuest, asyncHandler(authController.verifyOtp));
  router.get('/reset-password', ensureGuest, asyncHandler(authController.resetPasswordForm));
  router.post('/reset-password', ensureGuest, asyncHandler(authController.resetPassword));
  router.get('/logout', authController.logout);
  return router;
};
