require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const { getMongoUri } = require('./config/mongoUri');

const { sanitizeBody } = require('./utils/sanitize');
const { notFound, errorHandler } = require('./middlewares/error');
const { setLocals } = require('./middlewares/locals');

const app = express();
if (process.env.VERCEL) {
  app.set('trust proxy', 1);
}
const guardLogState = global.__mongoGuardLog || (global.__mongoGuardLog = {
  target: false,
  missing: false,
  ready: false,
  nextAttemptAt: 0
});
const MONGO_GUARD_RETRY_DELAY_MS = Number(
  process.env.MONGO_GUARD_RETRY_DELAY_MS || (process.env.VERCEL ? 10000 : 0)
);

function getMongoTarget(uri) {
  try {
    const parsed = new URL(uri);
    const host = parsed.host;
    const db = (parsed.pathname || '').replace(/^\//, '') || '(none)';
    return { host, db };
  } catch (err) {
    const match = uri.match(/mongodb\+srv:\/\/(?:[^@]+@)?([^/]+)\/([^?]+)/i);
    if (!match) return { host: '(unknown)', db: '(unknown)' };
    return { host: match[1], db: match[2] };
  }
}

// DB connect
const connectDB = require('./config/db');
connectDB().catch(err => {
  console.error('MongoDB connect failed:', err);
});

// Helmet security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'blob:', 'https://www.google-analytics.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: [
        "'self'",
        'https://api.open-meteo.com',
        'https://www.google-analytics.com',
        'https://overbridgenet.com'
      ],
      fontSrc: ["'self'", 'data:', 'https://fonts.gstatic.com'],
      objectSrc: ["'none'"]
    }
  }
}));

// Logger
app.use(morgan('dev'));

// Static (phá»¥c vá»¥ public ngoÃ i src)
app.use(express.static(path.join(__dirname, '../public')));
if (process.env.VERCEL) {
  app.use('/uploads', express.static('/tmp/uploads'));
}

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// Guard when MongoDB is not configured
const assetPrefixes = ['/css', '/js', '/images', '/uploads', '/downloads'];
const assetExtensions = new Set([
  '.css', '.js', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.gif',
  '.map', '.woff', '.woff2', '.ttf', '.eot'
]);
function isAssetRequest(reqPath) {
  if (assetPrefixes.some(prefix => reqPath.startsWith(prefix))) return true;
  return assetExtensions.has(path.extname(reqPath).toLowerCase());
}

app.use(async (req, res, next) => {
  const mongoUri = getMongoUri();
  if (isAssetRequest(req.path)) return next();

  if (!mongoUri) {
    if (!guardLogState.missing) {
      console.warn('MongoDB guard: MONGODB_URI missing or placeholder.');
      guardLogState.missing = true;
    }
    if (req.accepts('html')) {
      return res.status(503).render('error/503', {
        title: 'Tạm dừng dịch vụ',
        layout: false
      });
    }

    return res.status(503).json({ message: 'Database is not configured.' });
  }

  if (mongoose.connection.readyState === 1) {
    guardLogState.nextAttemptAt = 0;
    return next();
  }

  const now = Date.now();
  if (MONGO_GUARD_RETRY_DELAY_MS > 0 && guardLogState.nextAttemptAt && now < guardLogState.nextAttemptAt) {
    if (req.accepts('html')) {
      return res.status(503).render('error/503', {
        title: 'Tạm dừng dịch vụ',
        layout: false
      });
    }
    return res.status(503).json({ message: 'Database is not ready.' });
  }

  if (!guardLogState.target) {
    console.log('MongoDB guard target:', getMongoTarget(mongoUri));
    guardLogState.target = true;
  }
  if (!guardLogState.ready) {
    console.warn('MongoDB guard: readyState before connect:', mongoose.connection.readyState);
    guardLogState.ready = true;
  }
  if (MONGO_GUARD_RETRY_DELAY_MS > 0) {
    guardLogState.nextAttemptAt = now + MONGO_GUARD_RETRY_DELAY_MS;
  }

  connectDB().then(() => {
    if (mongoose.connection.readyState === 1) {
      guardLogState.nextAttemptAt = 0;
    }
  }).catch(err => {
    console.error('MongoDB connect failed (guard):', err);
  });

  if (req.accepts('html')) {
    return res.status(503).render('error/503', {
      title: 'Tạm dừng dịch vụ',
      layout: false
    });
  }

  return res.status(503).json({ message: 'Database is not ready.' });
});

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Session
const sessionOptions = {
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
};
const mongoUri = getMongoUri();
if (mongoUri) {
  const isVercel = !!process.env.VERCEL;
  const defaultTimeout = Number(process.env.MONGODB_TIMEOUT_MS || (isVercel ? 5000 : 20000));
  const mongoOptions = {
    serverSelectionTimeoutMS: Number(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS || defaultTimeout),
    connectTimeoutMS: Number(process.env.MONGODB_CONNECT_TIMEOUT_MS || defaultTimeout),
    socketTimeoutMS: Number(process.env.MONGODB_SOCKET_TIMEOUT_MS || defaultTimeout)
  };
  try {
    sessionOptions.store = MongoStore.create({
      mongoUrl: mongoUri,
      mongoOptions,
      collectionName: 'sessions'
    });
    if (sessionOptions.store?.on) {
      sessionOptions.store.on('error', err => {
        console.error('Session store error:', err?.message || err);
      });
    }
  } catch (err) {
    console.error('Session store init failed:', err?.message || err);
  }
}
app.use(session(sessionOptions));

// Flash messages
app.use(flash());

// Sanitize all POST bodies
app.use(sanitizeBody);

// Set locals for views
app.use(setLocals);

// Rate limiters
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: 'QuÃ¡ nhiá»u láº§n Ä‘Äƒng nháº­p, vui lÃ²ng thá»­ láº¡i sau.'
});
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 6,
  message: 'Bạn thao tác quá nhanh, vui lòng thử lại sau.'
});
const rescueLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Báº¡n gá»­i quÃ¡ nhiá»u phiáº¿u cá»©u há»™, vui lÃ²ng thá»­ láº¡i sau.'
});

// Routes
app.use('/', require('./routes/main'));
app.use('/tips', require('./routes/tip'));
app.use('/category', require('./routes/category'));
app.use('/tag', require('./routes/tag'));
app.use('/rescue', require('./routes/rescue')(rescueLimiter));
app.use('/profile', require('./routes/profile'));
app.use('/admin', require('./routes/admin'));
app.use('/auth', require('./routes/auth')(loginLimiter, otpLimiter));

// Sitemap & robots
app.use('/sitemap.xml', require('./routes/sitemap'));
app.use('/robots.txt', require('./routes/robots'));

// 404 & error
app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
  });
}

module.exports = app;
