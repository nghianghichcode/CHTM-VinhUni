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

const { sanitizeBody } = require('./utils/sanitize');
const { notFound, errorHandler } = require('./middlewares/error');
const { setLocals } = require('./middlewares/locals');

const app = express();

// DB connect
require('./config/db')();

// Helmet security
app.use(helmet());

// Logger
app.use(morgan('dev'));

// Static (phục vụ public ngoài src)
app.use(express.static(path.join(__dirname, '../public')));

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// Session
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

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
  message: 'Quá nhiều lần đăng nhập, vui lòng thử lại sau.'
});
const rescueLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: 'Bạn gửi quá nhiều phiếu cứu hộ, vui lòng thử lại sau.'
});

// Routes
app.use('/', require('./routes/main'));
app.use('/tips', require('./routes/tip'));
app.use('/category', require('./routes/category'));
app.use('/tag', require('./routes/tag'));
app.use('/rescue', require('./routes/rescue')(rescueLimiter));
app.use('/profile', require('./routes/profile'));
app.use('/admin', require('./routes/admin'));
app.use('/auth', require('./routes/auth')(loginLimiter));

// Sitemap & robots
app.use('/sitemap.xml', require('./routes/sitemap'));
app.use('/robots.txt', require('./routes/robots'));

// 404 & error
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
