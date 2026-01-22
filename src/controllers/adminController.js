const User = require('../models/User');
const Tip = require('../models/Tip');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Ticket = require('../models/Ticket');
const slugifyVN = require('../utils/slugify');
const { getMeta } = require('../utils/meta');

exports.loginForm = (req, res) => {
  res.render('admin/login');
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: 'admin' });
  if (!user || !(await require('bcrypt').compare(password, user.passwordHash))) {
    req.flash('error', 'Sai thông tin admin');
    return res.redirect('/admin/login');
  }
  req.session.user = { _id: user._id, name: user.name, email: user.email, role: user.role };
  res.redirect('/admin');
};

exports.dashboard = async (req, res) => {
  const stats = {
    tips: await Tip.countDocuments(),
    tickets: await Ticket.countDocuments(),
    ticketsByStatus: {
      NEW: await Ticket.countDocuments({ status: 'NEW' }),
      ACCEPTED: await Ticket.countDocuments({ status: 'ACCEPTED' }),
      IN_PROGRESS: await Ticket.countDocuments({ status: 'IN_PROGRESS' }),
      DONE: await Ticket.countDocuments({ status: 'DONE' }),
      REJECTED: await Ticket.countDocuments({ status: 'REJECTED' })
    },
    topTips: await Tip.find({ status: 'published' }).sort({ views: -1 }).limit(5)
  };
  res.render('admin/dashboard', { stats, meta: getMeta({ title: 'Admin Dashboard' }) });
};

// CRUD Tips
exports.tips = async (req, res) => {
  const tips = await Tip.find().populate('category tags').sort({ createdAt: -1 });
  res.render('admin/tips', { tips });
};

exports.tipForm = async (req, res) => {
  const categories = await Category.find();
  const tags = await Tag.find();
  let tip = null;
  if (req.params.id) tip = await Tip.findById(req.params.id);
  res.render('admin/tip-form', { tip, categories, tags });
};

exports.tipSave = async (req, res) => {
  const { id, title, excerpt, content, thumbnail, category, tags, status, isFeatured } = req.body;
  const slug = slugifyVN(title);
  if (id) {
    await Tip.findByIdAndUpdate(id, { title, slug, excerpt, content, thumbnail, category, tags, status, isFeatured: !!isFeatured });
  } else {
    await Tip.create({ title, slug, excerpt, content, thumbnail, category, tags, status, isFeatured: !!isFeatured });
  }
  res.redirect('/admin/tips');
};

exports.tipDelete = async (req, res) => {
  await Tip.findByIdAndDelete(req.params.id);
  res.redirect('/admin/tips');
};

// CRUD Category
exports.categories = async (req, res) => {
  const categories = await Category.find();
  res.render('admin/categories', { categories });
};

exports.categorySave = async (req, res) => {
  const { id, name } = req.body;
  const slug = slugifyVN(name);
  if (id) {
    await Category.findByIdAndUpdate(id, { name, slug });
  } else {
    await Category.create({ name, slug });
  }
  res.redirect('/admin/categories');
};

exports.categoryDelete = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.redirect('/admin/categories');
};

// CRUD Tag
exports.tags = async (req, res) => {
  const tags = await Tag.find();
  res.render('admin/tags', { tags });
};

exports.tagSave = async (req, res) => {
  const { id, name } = req.body;
  const slug = slugifyVN(name);
  if (id) {
    await Tag.findByIdAndUpdate(id, { name, slug });
  } else {
    await Tag.create({ name, slug });
  }
  res.redirect('/admin/tags');
};

exports.tagDelete = async (req, res) => {
  await Tag.findByIdAndDelete(req.params.id);
  res.redirect('/admin/tags');
};

// Ticket management
exports.tickets = async (req, res) => {
  const { status, q } = req.query;
  let filter = {};
  if (status) filter.status = status;
  if (q) filter.$or = [{ name: { $regex: q, $options: 'i' } }, { phone: { $regex: q } }];
  const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
  res.render('admin/tickets', { tickets });
};

exports.ticketDetail = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  res.render('admin/ticket-detail', { ticket });
};

exports.ticketUpdate = async (req, res) => {
  const { status, note } = req.body;
  const ticket = await Ticket.findById(req.params.id);
  if (status) ticket.status = status;
  if (note) ticket.adminNotes.push({ note });
  await ticket.save();
  res.redirect('/admin/tickets/' + req.params.id);
};
