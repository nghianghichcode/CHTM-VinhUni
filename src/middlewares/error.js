function notFound(req, res, next) {
  res.status(404).render('error/404', { title: '404 Not Found' });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  res.status(500).render('error/500', { title: 'Lỗi hệ thống', error: err });
}

module.exports = { notFound, errorHandler };
