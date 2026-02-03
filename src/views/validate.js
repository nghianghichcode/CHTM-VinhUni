// Basic validation helpers
function isRequired(val) {
  return val && val.trim().length > 0;
}

function minLength(val, len) {
  return val && val.trim().length >= len;
}

function isEmail(val) {
  return /^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(val);
}

function isPhone(val) {
  return /^0\d{9,10}$/.test(val);
}

module.exports = { isRequired, minLength, isEmail, isPhone };
