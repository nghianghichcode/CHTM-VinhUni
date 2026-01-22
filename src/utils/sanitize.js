// Basic sanitize for all POST body fields
function sanitizeBody(req, res, next) {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/<script.*?>.*?<\/script>/gi, '')
          .replace(/<.*?on\w+=".*?".*?>/gi, '')
          .replace(/javascript:/gi, '');
      }
    }
  }
  next();
}

module.exports = { sanitizeBody };
