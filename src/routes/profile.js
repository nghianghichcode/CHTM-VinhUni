const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const { ensureAuth } = require('../middlewares/auth');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { getMeta } = require('../utils/meta');

const uploadDir = path.join(__dirname, '../../public/uploads/avatars');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `avatar-${req.session.user._id}-${Date.now()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) return cb(new Error('Chỉ cho phép ảnh.'), false);
  return cb(null, true);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 2 * 1024 * 1024 } });

router.get('/', ensureAuth, async (req, res) => {
  const tickets = await Ticket.find({ user: req.session.user._id }).sort({ createdAt: -1 });
  res.render('profile', {
    tickets,
    meta: getMeta({ title: 'Hồ sơ của tôi' }),
    bodyClass: 'profile-page'
  });
});

router.post('/avatar', ensureAuth, upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    req.flash('error', 'Vui lòng chọn ảnh hợp lệ (tối đa 2MB).');
    return res.redirect('/profile');
  }

  const avatarUrl = `/uploads/avatars/${req.file.filename}`;
  await User.updateOne({ _id: req.session.user._id }, { $set: { avatarUrl } });
  req.session.user.avatarUrl = avatarUrl;
  req.flash('success', 'Cập nhật ảnh đại diện thành công.');
  return res.redirect('/profile');
});

router.post('/update', ensureAuth, async (req, res) => {
  const name = (req.body.name || '').trim();
  const phone = (req.body.phone || '').trim();
  const zalo = (req.body.zalo || '').trim();
  const facebook = (req.body.facebook || '').trim();
  const dob = req.body.dob ? new Date(req.body.dob) : undefined;

  if (!name || name.length < 2) {
    req.flash('error', 'Họ và tên tối thiểu 2 ký tự.');
    return res.redirect('/profile');
  }

  const update = {
    name,
    phone,
    zalo,
    facebook
  };

  if (dob && !Number.isNaN(dob.getTime())) {
    update.dob = dob;
  }

  await User.updateOne({ _id: req.session.user._id }, { $set: update });
  req.session.user = { ...req.session.user, ...update };
  req.flash('success', 'Cập nhật thông tin cá nhân thành công.');
  return res.redirect('/profile');
});

module.exports = router;
