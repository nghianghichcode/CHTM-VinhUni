function setLocals(req, res, next) {
  res.locals.user = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.meta = res.locals.meta || { title: 'Thủ Thuật & Cứu Hộ Máy Tính', description: '' };
  const baseClass = res.locals.bodyClass || '';
  const classList = new Set(baseClass.split(' ').filter(Boolean));
  classList.add('tet-binh-ngo');
  if (!classList.has('auth-page')) {
    classList.add('tet-page');
  }
  res.locals.bodyClass = Array.from(classList).join(' ');
  next();
}

module.exports = { setLocals };
