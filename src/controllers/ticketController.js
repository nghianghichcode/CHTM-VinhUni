const Ticket = require('../models/Ticket');
const mongoose = require('mongoose');
const { getMeta } = require('../utils/meta');

exports.intro = (req, res) => {
  res.render('rescue/intro', { meta: getMeta({ title: 'Cứu hộ máy tính' }) });
};

exports.newForm = (req, res) => {
  res.render('rescue/new', { meta: getMeta({ title: 'Tạo phiếu cứu hộ' }) });
};

exports.create = async (req, res) => {
  const { name, phone, email, deviceType, os, urgency, location, preferredTime, description, attachmentUrl } = req.body;
  await Ticket.create({
    user: req.session.user._id,
    name, phone, email, deviceType, os, urgency, location, preferredTime, description, attachmentUrl
  });
  req.flash('success', 'Đã gửi phiếu cứu hộ!');
  res.redirect('/rescue/my');
};

exports.myTickets = async (req, res) => {
  const tickets = await Ticket.find({ user: req.session.user._id }).sort({ createdAt: -1 });
  res.render('rescue/my', { tickets, meta: getMeta({ title: 'Phiếu cứu hộ của tôi' }) });
};

exports.detail = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(404).render('error/404');
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket || ticket.user.toString() !== req.session.user._id && req.session.user.role !== 'admin')
    return res.status(404).render('error/404');
  res.render('rescue/detail', { ticket, meta: getMeta({ title: 'Chi tiết phiếu cứu hộ' }) });
};
