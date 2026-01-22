function ensureAuth(req, res, next) {
  if (req.session.user) return next();
  req.flash('error', 'Bạn cần đăng nhập.');
  res.redirect('/auth/login');
}

function ensureAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') return next();
  req.flash('error', 'Chỉ admin mới truy cập được.');
  res.redirect('/admin/login');
}

function ensureGuest(req, res, next) {
  if (!req.session.user) return next();
  res.redirect('/');
}

module.exports = { ensureAuth, ensureAdmin, ensureGuest };
