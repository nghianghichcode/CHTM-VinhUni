const Tip = require('../models/Tip');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Contact = require('../models/Contact');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const { getMeta } = require('../utils/meta');
const { isRequired, isEmail, minLength } = require('../utils/validate');

exports.home = async (req, res) => {
  const featuredTips = await Tip.find({ status: 'published', isFeatured: true }).populate('category tags').limit(6).sort({ createdAt: -1 });
  const categories = await Category.find();
  const topTips = await Tip.find({ status: 'published' }).sort({ views: -1 }).limit(5);
  const tags = await Tag.find().limit(12);
  const stats = {
    tips: await Tip.countDocuments({ status: 'published' }),
    tickets: await Ticket.countDocuments(),
    users: await User.countDocuments()
  };
  res.render('home', {
    featuredTips,
    categories,
    topTips,
    tags,
    stats,
    meta: getMeta({ title: 'Cứu hộ máy tính VinhUni' })
  });
};

exports.faq = (req, res) => {
  res.render('faq', { meta: getMeta({ title: 'Câu hỏi thường gặp' }) });
};

exports.contact = (req, res) => {
  res.render('contact', { meta: getMeta({ title: 'Liên hệ' }) });
};

exports.contactPost = async (req, res) => {
  const { name, email, message } = req.body;
  if (!isRequired(name) || !isEmail(email) || !minLength(message, 10)) {
    req.flash('error', 'Vui lòng nhập đầy đủ thông tin hợp lệ (nội dung tối thiểu 10 ký tự).');
    return res.redirect('/contact');
  }
  await Contact.create({ name: name.trim(), email: email.trim(), message: message.trim() });
  req.flash('success', 'Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm.');
  res.redirect('/contact');
};
