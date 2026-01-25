const User = require('../models/User');
const bcrypt = require('bcrypt');

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
  res.redirect(user.role === 'admin' ? '/admin' : '/');
};

exports.registerForm = (req, res) => {
  res.render('auth/register', { bodyClass: 'auth-page' });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) {
    req.flash('error', 'Email đã tồn tại');
    return res.redirect('/auth/register');
  }
  const passwordHash = await bcrypt.hash(password, 10);
  await User.create({ name, email, passwordHash });
  req.flash('success', 'Đăng ký thành công, vui lòng đăng nhập');
  res.redirect('/auth/login');
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
};
