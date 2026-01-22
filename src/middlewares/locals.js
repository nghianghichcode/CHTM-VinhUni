function setLocals(req, res, next) {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.meta = res.locals.meta || { title: 'Thủ Thuật & Cứu Hộ Máy Tính', description: '' };
  next();
}

module.exports = { setLocals };
