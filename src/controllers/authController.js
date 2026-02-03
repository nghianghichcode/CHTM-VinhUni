const User = require('../models/User');
const OtpToken = require('../models/OtpToken');
const ResetToken = require('../models/ResetToken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { isRequired, isEmail, minLength } = require('../utils/validate');
const { sendOtpEmail } = require('../utils/mailer');

const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS || 5);
const RESET_TOKEN_TTL_MINUTES = Number(process.env.RESET_TOKEN_TTL_MINUTES || 15);
const LOGIN_MAX_ATTEMPTS = Number(process.env.LOGIN_MAX_ATTEMPTS || 5);
const LOGIN_LOCK_MINUTES = Number(process.env.LOGIN_LOCK_MINUTES || 10);

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

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

function hashToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

exports.loginForm = (req, res) => {
  res.render('auth/login', { bodyClass: 'auth-page' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const emailNormalized = (email || '').trim().toLowerCase();
  const user = await User.findOne({ email: emailNormalized });

  if (user?.loginLockUntil && user.loginLockUntil.getTime() > Date.now()) {
    const remainingMs = user.loginLockUntil.getTime() - Date.now();
    const remainingMinutes = Math.max(1, Math.ceil(remainingMs / 60000));
    req.flash('error', `Tài khoản tạm bị khóa. Vui lòng thử lại sau ${remainingMinutes} phút.`);
    return res.redirect('/auth/login');
  }

  const isPasswordValid = user && await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    if (user) {
      const nextAttempts = (user.loginAttempts || 0) + 1;
      if (nextAttempts >= LOGIN_MAX_ATTEMPTS) {
        user.loginAttempts = 0;
        user.loginLockUntil = new Date(Date.now() + LOGIN_LOCK_MINUTES * 60 * 1000);
        await user.save();
        req.flash('error', `Bạn đã nhập sai quá ${LOGIN_MAX_ATTEMPTS} lần. Tài khoản bị khóa ${LOGIN_LOCK_MINUTES} phút.`);
        return res.redirect('/auth/login');
      }
      user.loginAttempts = nextAttempts;
      user.loginLockUntil = null;
      await user.save();
      const remaining = LOGIN_MAX_ATTEMPTS - nextAttempts;
      req.flash('error', `Sai email hoặc mật khẩu. Bạn còn ${remaining} lần thử.`);
      return res.redirect('/auth/login');
    }
    req.flash('error', 'Sai email hoặc mật khẩu');
    return res.redirect('/auth/login');
  }

  if (user.loginAttempts || user.loginLockUntil) {
    user.loginAttempts = 0;
    user.loginLockUntil = null;
    await user.save();
  }
  req.session.user = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatarUrl: user.avatarUrl || '',
    dob: user.dob || null,
    phone: user.phone || '',
    zalo: user.zalo || '',
    facebook: user.facebook || ''
  };
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
    return res.render('auth/verify-otp', {
      bodyClass: 'auth-page',
      purpose: 'register',
      emailMasked: maskEmail(emailNormalized),
      emailValue: ''
    });
  } catch (err) {
    console.error('Send OTP failed:', err?.message || err);
    if (err?.code || err?.response) {
      console.error('Send OTP details:', { code: err.code, response: err.response });
    }
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
  let sendFailed = false;
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
      console.error('Send OTP failed:', err?.message || err);
      if (err?.code || err?.response) {
        console.error('Send OTP details:', { code: err.code, response: err.response });
      }
      sendFailed = true;
    }
  }

  req.session.resetEmail = emailNormalized;
  if (sendFailed) {
    req.flash('error', 'Không thể gửi email OTP. Vui lòng thử lại sau.');
  } else {
    req.flash('success', 'Đã gửi mã OTP về mail, vui lòng kiểm tra.');
  }
  return res.redirect(`/auth/verify-otp?purpose=reset&email=${encodeURIComponent(emailNormalized)}`);
};

exports.resendOtp = async (req, res) => {
  const purpose = req.query.purpose;
  if (!['register', 'reset'].includes(purpose)) {
    return res.redirect('/auth/login');
  }

  const emailFromQuery = (req.query.email || '').trim().toLowerCase();
  const email = purpose === 'register'
    ? req.session.pendingRegister?.email
    : req.session.resetEmail || emailFromQuery;

  if (!email) {
    req.flash('error', 'Phiên làm việc đã hết hạn. Vui lòng thực hiện lại.');
    return res.redirect(purpose === 'register' ? '/auth/register' : '/auth/forgot');
  }

  if (purpose === 'reset' && !req.session.resetEmail && emailFromQuery) {
    req.session.resetEmail = emailFromQuery;
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
    console.error('Send OTP failed:', err?.message || err);
    if (err?.code || err?.response) {
      console.error('Send OTP details:', { code: err.code, response: err.response });
    }
    req.flash('error', 'Không thể gửi email OTP. Vui lòng thử lại sau.');
    return res.redirect(`/auth/verify-otp?purpose=${purpose}`);
  }
};

exports.verifyOtpForm = (req, res) => {
  const purpose = req.query.purpose;
  if (!['register', 'reset'].includes(purpose)) {
    return res.redirect('/auth/login');
  }
  const emailFromQuery = (req.query.email || '').trim().toLowerCase();
  const emailFromBody = (req.body.email || '').trim().toLowerCase();
  const email = purpose === 'register'
    ? req.session.pendingRegister?.email
    : req.session.resetEmail || emailFromQuery || emailFromBody;

  if (!email) {
    req.flash('error', 'Phiên làm việc đã hết hạn. Vui lòng thực hiện lại.');
    return res.redirect(purpose === 'register' ? '/auth/register' : '/auth/forgot');
  }

  res.render('auth/verify-otp', {
    bodyClass: 'auth-page',
    purpose,
    emailMasked: maskEmail(email),
    emailValue: purpose === 'reset' ? email : ''
  });
};

exports.verifyOtp = async (req, res) => {
  const { otp, purpose } = req.body;
  if (!['register', 'reset'].includes(purpose)) {
    return res.redirect('/auth/login');
  }
  const email = purpose === 'register'
    ? req.session.pendingRegister?.email
    : req.session.resetEmail || String(req.body.email || '').trim().toLowerCase();

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
      role: createdUser.role,
      avatarUrl: createdUser.avatarUrl || '',
      dob: createdUser.dob || null,
      phone: createdUser.phone || '',
      zalo: createdUser.zalo || '',
      facebook: createdUser.facebook || ''
    };
    req.flash('success', 'Đăng ký thành công. Chào mừng bạn!');
    return res.redirect('/');
  }

  const resetToken = generateResetToken();
  const resetExpiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);
  await ResetToken.deleteMany({ email });
  await ResetToken.create({
    email,
    tokenHash: hashToken(resetToken),
    expiresAt: resetExpiresAt
  });

  if (req.session) {
    if (!req.session.resetEmail && email) {
      req.session.resetEmail = email;
    }
    req.session.resetVerified = true;
  }
  req.flash('success', 'Xác thực OTP thành công. Vui lòng đặt lại mật khẩu.');
  return res.redirect(`/auth/reset-password?token=${encodeURIComponent(resetToken)}`);
};

exports.resetPasswordForm = async (req, res) => {
  const token = String(req.query.token || '').trim();
  if (token) {
    const tokenHash = hashToken(token);
    const record = await ResetToken.findOne({ tokenHash });
    if (!record || record.expiresAt < new Date()) {
      if (record) await record.deleteOne();
      req.flash('error', 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return res.redirect('/auth/forgot');
    }
    return res.render('auth/reset-password', { bodyClass: 'auth-page', resetToken: token });
  }

  if (!req.session.resetVerified || !req.session.resetEmail) {
    req.flash('error', 'Vui lòng xác thực OTP trước.');
    return res.redirect('/auth/forgot');
  }
  res.render('auth/reset-password', { bodyClass: 'auth-page', resetToken: '' });
};

exports.resetPassword = async (req, res) => {
  const { password, token } = req.body;
  const tokenValue = String(token || '').trim();
  let tokenRecord = null;
  let email = req.session.resetEmail;

  if (tokenValue) {
    const tokenHash = hashToken(tokenValue);
    tokenRecord = await ResetToken.findOne({ tokenHash });
    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      if (tokenRecord) await tokenRecord.deleteOne();
      req.flash('error', 'Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.');
      return res.redirect('/auth/forgot');
    }
    email = tokenRecord.email;
  } else if (!req.session.resetVerified || !req.session.resetEmail) {
    req.flash('error', 'Vui lòng xác thực OTP trước.');
    return res.redirect('/auth/forgot');
  }

  const resetRedirect = tokenValue
    ? `/auth/reset-password?token=${encodeURIComponent(tokenValue)}`
    : '/auth/reset-password';

  if (!minLength(password, 6)) {
    req.flash('error', 'Mật khẩu tối thiểu 6 ký tự.');
    return res.redirect(resetRedirect);
  }
  const user = await User.findOne({ email }).select('passwordHash');
  if (!user) {
    req.flash('error', 'Tài khoản không tồn tại. Vui lòng thực hiện lại.');
    return res.redirect('/auth/forgot');
  }
  if (await bcrypt.compare(password, user.passwordHash)) {
    req.flash('error', 'Mật khẩu mới phải khác mật khẩu hiện tại.');
    return res.redirect(resetRedirect);
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await User.updateOne({ email }, { $set: { passwordHash } });
  if (tokenRecord) {
    await ResetToken.deleteMany({ email });
  }
  if (req.session) {
    delete req.session.resetVerified;
    delete req.session.resetEmail;
  }
  req.flash('success', 'Đổi mật khẩu thành công. Vui lòng đăng nhập.');
  res.redirect('/auth/login');
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
