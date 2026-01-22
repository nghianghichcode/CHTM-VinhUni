const Tip = require('../models/Tip');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const { getMeta } = require('../utils/meta');

exports.list = async (req, res) => {
  const { category, tag, q, sort } = req.query;
  let filter = { status: 'published' };
  if (category) filter.category = category;
  if (tag) filter.tags = tag;
  if (q) filter.title = { $regex: q, $options: 'i' };
  let sortOpt = { createdAt: -1 };
  if (sort === 'views') sortOpt = { views: -1 };
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
    selectedSort: sort || '',
    meta: getMeta({ title: 'Thư viện thủ thuật' })
  });
};

exports.detail = async (req, res) => {
  const tip = await Tip.findOne({ slug: req.params.slug, status: 'published' }).populate('category tags');
  if (!tip) return res.status(404).render('error/404');
  tip.views += 1;
  await tip.save();
  const related = await Tip.find({ _id: { $ne: tip._id }, category: tip.category, status: 'published' }).limit(4);
  res.render('tips/detail', {
    tip, related, meta: getMeta({ title: tip.title, description: tip.excerpt })
  });
};

exports.byCategory = async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) return res.status(404).render('error/404');
  const tips = await Tip.find({ category: category._id, status: 'published' }).populate('category tags').limit(20);
  res.render('tips/list', {
    tips, categories: [category], tags: [], meta: getMeta({ title: `Thủ thuật: ${category.name}` })
  });
};

exports.byTag = async (req, res) => {
  const tag = await Tag.findOne({ slug: req.params.slug });
  if (!tag) return res.status(404).render('error/404');
  const tips = await Tip.find({ tags: tag._id, status: 'published' }).populate('category tags').limit(20);
  res.render('tips/list', {
    tips, categories: [], tags: [tag], meta: getMeta({ title: `Thủ thuật: ${tag.name}` })
  });
};
