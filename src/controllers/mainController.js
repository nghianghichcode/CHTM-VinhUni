const Tip = require('../models/Tip');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Contact = require('../models/Contact');
const RescueRequest = require('../models/RescueRequest');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const SiteStat = require('../models/SiteStat');
const { getMeta } = require('../utils/meta');
const { isRequired, isEmail, isPhone, minLength } = require('../utils/validate');

exports.home = async (req, res) => {
  const featuredTips = await Tip.find({ status: 'published', isFeatured: true }).populate('category tags').limit(6).sort({ createdAt: -1 });
  const latestTips = await Tip.find({ status: 'published' }).populate('category').limit(3).sort({ createdAt: -1 });
  const categories = await Category.find();
  const topTips = await Tip.find({ status: 'published' }).sort({ views: -1 }).limit(5);
  const tags = await Tag.find().limit(12);
  const stats = {
    tips: await Tip.countDocuments({ status: 'published' }),
    tickets: await Ticket.countDocuments(),
    users: await User.countDocuments(),
    visits: (await SiteStat.findOne({ key: 'visits' }))?.value || 0
  };
  res.render('home', {
    featuredTips,
    latestTips,
    categories,
    topTips,
    tags,
    stats,
    meta: getMeta({ title: 'Cứu hộ máy tính VinhUni' }),
    bodyClass: 'home'
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

exports.rescueRequestPost = async (req, res) => {
  const { name, phone, issue } = req.body;
  if (!isRequired(name) || !isPhone(phone) || !minLength(issue, 8)) {
    req.flash('error', 'Vui lòng nhập đầy đủ thông tin hợp lệ (mô tả lỗi tối thiểu 8 ký tự).');
    return res.redirect('/');
  }
  await RescueRequest.create({
    name: name.trim(),
    phone: phone.trim(),
    issue: issue.trim()
  });
  req.flash('success', 'Đã ghi nhận yêu cầu! Đội sẽ liên hệ với bạn sớm nhất.');
  res.redirect('/');
};
