function sanitizeUri(raw) {
  if (!raw) return null;
  let uri = String(raw).trim();
  if ((uri.startsWith('"') && uri.endsWith('"')) || (uri.startsWith("'") && uri.endsWith("'"))) {
    uri = uri.slice(1, -1);
  }
  return uri.trim();
}

function hasPlaceholder(uri) {
  return /<[^>]+>/.test(uri) || /your_(user|pass|password)/i.test(uri);
}

function buildMongoUriFromParts() {
  const host = process.env.MONGODB_HOST;
  const db = process.env.MONGODB_DB;
  const user = process.env.MONGODB_USER;
  const pass = process.env.MONGODB_PASS;

  if (!host || !db || !user || !pass) return null;

  const options = process.env.MONGODB_OPTIONS || 'retryWrites=true&w=majority';
  const appName = process.env.MONGODB_APP_NAME;
  const encodedUser = encodeURIComponent(user);
  const encodedPass = encodeURIComponent(pass);
  const fullOptions = appName
    ? `${options}&appName=${encodeURIComponent(appName)}`
    : options;

  return `mongodb+srv://<redacted>
}

function getMongoUri() {
  const raw =
    process.env.MONGODB_URI ||
    process.env.MONGODB_CONNECTIONSTRING ||
    buildMongoUriFromParts();
  const uri = sanitizeUri(raw);
  if (!uri || hasPlaceholder(uri)) return null;
  return uri;
}

module.exports = { getMongoUri };
