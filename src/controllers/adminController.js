const User = require('../models/User');
const Tip = require('../models/Tip');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const Ticket = require('../models/Ticket');
const Contact = require('../models/Contact');
const SiteStat = require('../models/SiteStat');
const mongoose = require('mongoose');
const slugifyVN = require('../utils/slugify');
const { getMeta } = require('../utils/meta');
const { escapeRegex } = require('../utils/escapeRegex');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function renderNotFound(res) {
  return res.status(404).render('error/404');
}

exports.loginForm = (req, res) => {
  res.render('admin/login');
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const emailNormalized = (email || '').trim().toLowerCase();
  const user = await User.findOne({ email: emailNormalized, role: 'admin' });
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
    visits: (await SiteStat.findOne({ key: 'visits' }))?.value || 0,
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
  let tip = null;
  if (req.params.id) {
    if (!isValidObjectId(req.params.id)) return renderNotFound(res);
    tip = await Tip.findById(req.params.id);
    if (!tip) return renderNotFound(res);
  }
  const categories = await Category.find();
  const tags = await Tag.find();
  res.render('admin/tip-form', { tip, categories, tags });
};

exports.tipSave = async (req, res) => {
  const { id, title, excerpt, content, thumbnail, category, tags, status, isFeatured, removeThumbnail } = req.body;
  if (id && !isValidObjectId(id)) return renderNotFound(res);
  const slug = slugifyVN(title);
  const tagsArray = Array.isArray(tags) ? tags : (tags ? [tags] : []);
  let thumbnailPath = thumbnail;
  if (removeThumbnail) thumbnailPath = '';
  if (req.file) thumbnailPath = `/uploads/tips/${req.file.filename}`;
  if (id) {
    const updated = await Tip.findByIdAndUpdate(id, {
      title,
      slug,
      excerpt,
      content,
      thumbnail: thumbnailPath,
      category,
      tags: tagsArray,
      status,
      isFeatured: !!isFeatured,
      updatedAt: Date.now()
    });
    if (!updated) return renderNotFound(res);
  } else {
    await Tip.create({
      title,
      slug,
      excerpt,
      content,
      thumbnail: thumbnailPath,
      category,
      tags: tagsArray,
      status,
      isFeatured: !!isFeatured
    });
  }
  res.redirect('/admin/tips');
};

exports.tipImageUpload = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ url: `/uploads/tips/${req.file.filename}` });
};

exports.tipDelete = async (req, res) => {
  if (!isValidObjectId(req.params.id)) return renderNotFound(res);
  const deleted = await Tip.findByIdAndDelete(req.params.id);
  if (!deleted) return renderNotFound(res);
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
    if (!isValidObjectId(id)) return renderNotFound(res);
    const updated = await Category.findByIdAndUpdate(id, { name, slug });
    if (!updated) return renderNotFound(res);
  } else {
    await Category.create({ name, slug });
  }
  res.redirect('/admin/categories');
};

exports.categoryDelete = async (req, res) => {
  if (!isValidObjectId(req.params.id)) return renderNotFound(res);
  const deleted = await Category.findByIdAndDelete(req.params.id);
  if (!deleted) return renderNotFound(res);
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
    if (!isValidObjectId(id)) return renderNotFound(res);
    const updated = await Tag.findByIdAndUpdate(id, { name, slug });
    if (!updated) return renderNotFound(res);
  } else {
    await Tag.create({ name, slug });
  }
  res.redirect('/admin/tags');
};

exports.tagDelete = async (req, res) => {
  if (!isValidObjectId(req.params.id)) return renderNotFound(res);
  const deleted = await Tag.findByIdAndDelete(req.params.id);
  if (!deleted) return renderNotFound(res);
  res.redirect('/admin/tags');
};

// Ticket management
exports.tickets = async (req, res) => {
  const { status, q } = req.query;
  let filter = {};
  if (status) filter.status = status;
  if (q) {
    const safeQuery = escapeRegex(q);
    filter.$or = [
      { name: { $regex: safeQuery, $options: 'i' } },
      { phone: { $regex: safeQuery } }
    ];
  }
  const tickets = await Ticket.find(filter).sort({ createdAt: -1 });
  res.render('admin/tickets', { tickets, query: q || '', selectedStatus: status || '' });
};

exports.ticketDetail = async (req, res) => {
  if (!isValidObjectId(req.params.id)) return renderNotFound(res);
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return renderNotFound(res);
  res.render('admin/ticket-detail', { ticket });
};

exports.ticketUpdate = async (req, res) => {
  const { status, note } = req.body;
  if (!isValidObjectId(req.params.id)) return renderNotFound(res);
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return renderNotFound(res);
  if (status) ticket.status = status;
  if (note) ticket.adminNotes.push({ note });
  await ticket.save();
  res.redirect('/admin/tickets/' + req.params.id);
};

// Contact messages
exports.contacts = async (req, res) => {
  const contacts = await Contact.find().sort({ createdAt: -1 }).limit(100);
  res.render('admin/contacts', { contacts, meta: getMeta({ title: 'Liên hệ' }) });
};
