const User = require('../models/User');
const OtpToken = require('../models/OtpToken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { isRequired, isEmail, minLength } = require('../utils/validate');
const { sendOtpEmail } = require('../utils/mailer');

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);

function maskEmail(email = '') {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  const safeName = name.length <= 2 ? `${name[0] || ''}*` : `${name[0]}***${name[name.length - 1]}`;
  const parts = domain.split('.');
  const safeDomain = parts.length
    ? `${parts[0][0] || '*'}***.${parts.slice(1).join('.')}`
    : domain;
  return `${safeName}@${safeDomain}`;
}

function generateOtp() {
  const code = crypto.randomInt(100000, 1000000);
  return String(code);
}

exports.loginForm = (req, res) => {
  res.render('auth/login', { bodyClass: 'auth-page' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    req.flash('error', 'Sai email hoặc mật khẩu');
    return res.redirect('/auth/login');
  }
  req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
  req.flash('success', 'Đăng nhập thành công.');
  res.redirect(user.role === 'admin' ? '/admin' : '/');
};

exports.registerForm = (req, res) => {
  res.render('auth/register', { bodyClass: 'auth-page' });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  const emailNormalized = (email || '').trim().toLowerCase();
  if (!isRequired(name) || !isEmail(email) || !minLength(password, 6)) {
    req.flash('error', 'Vui lòng nhập đầy đủ thông tin hợp lệ (mật khẩu tối thiểu 6 ký tự).');
    return res.redirect('/auth/register');
  }
  if (await User.findOne({ email: emailNormalized })) {
    req.flash('error', 'Email đã tồn tại');
    return res.redirect('/auth/register');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  req.session.pendingRegister = { name: name.trim(), email: emailNormalized, passwordHash };

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await OtpToken.deleteMany({ email: emailNormalized, purpose: 'register' });
  await OtpToken.create({
    email: emailNormalized,
    purpose: 'register',
    codeHash: await bcrypt.hash(otp, 10),
    expiresAt
  });

  try {
    await sendOtpEmail({ to: emailNormalized, code: otp, purpose: 'register', expiresAt });
    req.flash('success', 'Đã gửi mã OTP đến email. Vui lòng kiểm tra hộp thư.');
    return res.redirect('/auth/verify-otp?purpose=register');
  } catch (err) {
    console.error('Send OTP failed:', err.message);
    req.flash('error', 'Không thể gửi email OTP. Vui lòng thử lại sau.');
    return res.redirect('/auth/register');
  }
};

exports.forgotForm = (req, res) => {
  res.render('auth/forgot', { bodyClass: 'auth-page' });
};

exports.forgot = async (req, res) => {
  const { email } = req.body;
  const emailNormalized = (email || '').trim().toLowerCase();
  if (!isEmail(email)) {
    req.flash('error', 'Vui lòng nhập email hợp lệ.');
    return res.redirect('/auth/forgot');
  }

  const user = await User.findOne({ email: emailNormalized });
  if (user) {
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
    await OtpToken.deleteMany({ email: emailNormalized, purpose: 'reset' });
    await OtpToken.create({
      email: emailNormalized,
      purpose: 'reset',
      codeHash: await bcrypt.hash(otp, 10),
      expiresAt
    });

    try {
      await sendOtpEmail({ to: emailNormalized, code: otp, purpose: 'reset', expiresAt });
    } catch (err) {
      console.error('Send OTP failed:', err.message);
      req.flash('error', 'Không thể gửi email OTP. Vui lòng thử lại sau.');
      return res.redirect('/auth/forgot');
    }
  }

  req.session.resetEmail = emailNormalized;
  req.flash('success', 'Đã gửi mã OTP về mail, vui lòng kiểm tra.');
  res.redirect('/auth/verify-otp?purpose=reset');
};

exports.resendOtp = async (req, res) => {
  const purpose = req.query.purpose;
  if (!['register', 'reset'].includes(purpose)) {
    return res.redirect('/auth/login');
  }

  const email = purpose === 'register'
    ? req.session.pendingRegister?.email
    : req.session.resetEmail;

  if (!email) {
    req.flash('error', 'Phiên làm việc đã hết hạn. Vui lòng thực hiện lại.');
    return res.redirect(purpose === 'register' ? '/auth/register' : '/auth/forgot');
  }

  const emailNormalized = email.trim().toLowerCase();
  if (purpose === 'reset') {
    const user = await User.findOne({ email: emailNormalized });
    if (!user) {
      req.flash('success', 'Đã gửi mã OTP về mail, vui lòng kiểm tra.');
      return res.redirect('/auth/verify-otp?purpose=reset');
    }
  }

  const otp = generateOtp();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await OtpToken.deleteMany({ email: emailNormalized, purpose });
  await OtpToken.create({
    email: emailNormalized,
    purpose,
    codeHash: await bcrypt.hash(otp, 10),
    expiresAt
  });

  try {
    await sendOtpEmail({ to: emailNormalized, code: otp, purpose, expiresAt });
    req.flash('success', 'Đã gửi mã OTP về mail, vui lòng kiểm tra.');
    return res.redirect(`/auth/verify-otp?purpose=${purpose}`);
  } catch (err) {
    console.error('Send OTP failed:', err.message);
    req.flash('error', 'Không thể gửi email OTP. Vui lòng thử lại sau.');
    return res.redirect(`/auth/verify-otp?purpose=${purpose}`);
  }
};

exports.verifyOtpForm = (req, res) => {
  const purpose = req.query.purpose;
  if (!['register', 'reset'].includes(purpose)) {
    return res.redirect('/auth/login');
  }
  const email = purpose === 'register'
    ? req.session.pendingRegister?.email
    : req.session.resetEmail;

  if (!email) {
    req.flash('error', 'Phiên làm việc đã hết hạn. Vui lòng thực hiện lại.');
    return res.redirect(purpose === 'register' ? '/auth/register' : '/auth/forgot');
  }

  res.render('auth/verify-otp', {
    bodyClass: 'auth-page',
    purpose,
    emailMasked: maskEmail(email)
  });
};

exports.verifyOtp = async (req, res) => {
  const { otp, purpose } = req.body;
  if (!['register', 'reset'].includes(purpose)) {
    return res.redirect('/auth/login');
  }
  const email = purpose === 'register'
    ? req.session.pendingRegister?.email
    : req.session.resetEmail;

  if (!email) {
    req.flash('error', 'Phiên làm việc đã hết hạn. Vui lòng thực hiện lại.');
    return res.redirect(purpose === 'register' ? '/auth/register' : '/auth/forgot');
  }
  const token = await OtpToken.findOne({ email, purpose });
  if (!token || token.expiresAt < new Date()) {
    if (token) await token.deleteOne();
    req.flash('error', 'Mã OTP đã hết hạn. Vui lòng yêu cầu lại.');
    return res.redirect(purpose === 'register' ? '/auth/register' : '/auth/forgot');
  }
  if (token.attempts >= OTP_MAX_ATTEMPTS) {
    await token.deleteOne();
    req.flash('error', 'Bạn đã nhập sai quá số lần cho phép.');
    return res.redirect(purpose === 'register' ? '/auth/register' : '/auth/forgot');
  }

  const isMatch = await bcrypt.compare(String(otp || '').trim(), token.codeHash);
  if (!isMatch) {
    token.attempts += 1;
    await token.save();
    req.flash('error', 'Mã OTP không đúng.');
    return res.redirect(`/auth/verify-otp?purpose=${purpose}`);
  }

  await token.deleteOne();

  if (purpose === 'register') {
    const pending = req.session.pendingRegister;
    if (!pending) {
      req.flash('error', 'Phiên làm việc đã hết hạn. Vui lòng đăng ký lại.');
      return res.redirect('/auth/register');
    }
    const createdUser = await User.create(pending);
    delete req.session.pendingRegister;
    req.session.user = {
      _id: createdUser._id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role
    };
    req.flash('success', 'Đăng ký thành công. Chào mừng bạn!');
    return res.redirect('/');
  }

  req.session.resetVerified = true;
  req.flash('success', 'Xác thực OTP thành công. Vui lòng đặt lại mật khẩu.');
  return res.redirect('/auth/reset-password');
};

exports.resetPasswordForm = (req, res) => {
  if (!req.session.resetVerified || !req.session.resetEmail) {
    req.flash('error', 'Vui lòng xác thực OTP trước.');
    return res.redirect('/auth/forgot');
  }
  res.render('auth/reset-password', { bodyClass: 'auth-page' });
};

exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  if (!req.session.resetVerified || !req.session.resetEmail) {
    req.flash('error', 'Vui lòng xác thực OTP trước.');
    return res.redirect('/auth/forgot');
  }
  if (!minLength(password, 6)) {
    req.flash('error', 'Mật khẩu tối thiểu 6 ký tự.');
    return res.redirect('/auth/reset-password');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await User.updateOne({ email: req.session.resetEmail }, { $set: { passwordHash } });
  delete req.session.resetVerified;
  delete req.session.resetEmail;
  req.flash('success', 'Đổi mật khẩu thành công. Vui lòng đăng nhập.');
  res.redirect('/auth/login');
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
