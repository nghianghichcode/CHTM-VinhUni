const Tip = require('../models/Tip');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const mongoose = require('mongoose');
const { getMeta } = require('../utils/meta');
const { escapeRegex } = require('../utils/escapeRegex');

exports.list = async (req, res) => {
  const { category, tag, q, sort } = req.query;
  let filter = { status: 'published' };
  if (category) {
    if (!mongoose.Types.ObjectId.isValid(category)) return res.status(404).render('error/404');
    filter.category = category;
  }
  if (tag) {
    if (!mongoose.Types.ObjectId.isValid(tag)) return res.status(404).render('error/404');
    filter.tags = tag;
  }
  if (q) filter.title = { $regex: escapeRegex(q), $options: 'i' };
  const sortOptions = {
    views: { views: -1 },
    newest: { createdAt: -1 }
  };
  const sortOpt = sortOptions[sort] || { createdAt: -1 };
  const tips = await Tip.find(filter).populate('category tags').sort(sortOpt).limit(20);
  const categories = await Category.find();
  const tags = await Tag.find();
  res.render('tips/list', {
    tips,
    categories,
    tags,
    query: q || '',
    selectedCategory: category || '',
    selectedTag: tag || '',
    selectedSort: sort === 'views' ? 'views' : '',
    meta: getMeta({ title: 'Thư viện thủ thuật' })
  });
};

exports.detail = async (req, res) => {
  const tip = await Tip.findOne({ slug: req.params.slug, status: 'published' }).populate('category tags');
  if (!tip) return res.status(404).render('error/404');

  // Avoid full document validation when counting views for legacy records.
  await Tip.updateOne({ _id: tip._id }, { $inc: { views: 1 } });

  const categoryId = tip.category?._id || tip.category;
  const related = await Tip.find({
    _id: { $ne: tip._id },
    category: categoryId,
    status: 'published'
  }).limit(4);
  res.render('tips/detail', {
    tip,
    related,
    meta: getMeta({ title: tip.title, description: tip.excerpt }),
    bodyClass: 'tip-detail-page'
  });
};

exports.byCategory = async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) return res.status(404).render('error/404');
  const tips = await Tip.find({ category: category._id, status: 'published' }).populate('category tags').limit(20);
  const categories = await Category.find();
  const tags = await Tag.find();
  res.render('tips/list', {
    tips,
    categories,
    tags,
    query: '',
    selectedCategory: category._id,
    selectedTag: '',
    selectedSort: '',
    meta: getMeta({ title: `Thủ thuật: ${category.name}` })
  });
};

exports.byTag = async (req, res) => {
  const tag = await Tag.findOne({ slug: req.params.slug });
  if (!tag) return res.status(404).render('error/404');
  const tips = await Tip.find({ tags: tag._id, status: 'published' }).populate('category tags').limit(20);
  const categories = await Category.find();
  const tags = await Tag.find();
  res.render('tips/list', {
    tips,
    categories,
    tags,
    query: '',
    selectedCategory: '',
    selectedTag: tag._id,
    selectedSort: '',
    meta: getMeta({ title: `Thủ thuật: ${tag.name}` })
  });
};
