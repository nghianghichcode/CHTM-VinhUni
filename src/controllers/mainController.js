const Tip = require('../models/Tip');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const { getMeta } = require('../utils/meta');

exports.home = async (req, res) => {
  const featuredTips = await Tip.find({ status: 'published', isFeatured: true }).populate('category tags').limit(6).sort({ createdAt: -1 });
  const categories = await Category.find();
  const topTips = await Tip.find({ status: 'published' }).sort({ views: -1 }).limit(5);
  const tags = await Tag.find().limit(12);
  const stats = {
    tips: await Tip.countDocuments({ status: 'published' }),
    tickets: 0, // cập nhật ở controller ticket nếu muốn
    users: 0
  };
  res.render('home', {
    featuredTips,
    categories,
    topTips,
    tags,
    stats,
    meta: getMeta({ title: 'Thủ Thuật & Cứu Hộ Máy Tính' })
  });
};

exports.faq = (req, res) => {
  res.render('faq', { meta: getMeta({ title: 'Câu hỏi thường gặp' }) });
};

exports.contact = (req, res) => {
  res.render('contact', { meta: getMeta({ title: 'Liên hệ' }) });
};
