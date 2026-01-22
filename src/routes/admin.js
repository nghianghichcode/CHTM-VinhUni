const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAdmin, ensureGuest } = require('../middlewares/auth');

router.use((req, res, next) => {
	res.locals.layout = 'layouts/admin';
	next();
});

router.get('/login', ensureGuest, adminController.loginForm);
router.post('/login', ensureGuest, adminController.login);

router.use(ensureAdmin);

router.get('/', adminController.dashboard);

// Tips
router.get('/tips', adminController.tips);
router.get('/tips/new', adminController.tipForm);
router.get('/tips/:id/edit', adminController.tipForm);
router.post('/tips/save', adminController.tipSave);
router.post('/tips/:id/delete', adminController.tipDelete);

// Categories
router.get('/categories', adminController.categories);
router.post('/categories/save', adminController.categorySave);
router.post('/categories/:id/delete', adminController.categoryDelete);

// Tags
router.get('/tags', adminController.tags);
router.post('/tags/save', adminController.tagSave);
router.post('/tags/:id/delete', adminController.tagDelete);

// Tickets
router.get('/tickets', adminController.tickets);
router.get('/tickets/:id', adminController.ticketDetail);
router.post('/tickets/:id/update', adminController.ticketUpdate);

// Contacts
router.get('/contacts', adminController.contacts);

module.exports = router;
