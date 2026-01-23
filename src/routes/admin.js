const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAdmin, ensureGuest } = require('../middlewares/auth');

const uploadDir = path.join(__dirname, '../../public/uploads/tips');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, uploadDir),
	filename: (req, file, cb) => {
		const ext = path.extname(file.originalname);
		const safe = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
		cb(null, safe);
	}
});

const fileFilter = (req, file, cb) => {
	if (file.mimetype && file.mimetype.startsWith('image/')) return cb(null, true);
	cb(new Error('Invalid file type'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

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
router.post('/tips/save', upload.single('thumbnailFile'), adminController.tipSave);
router.post('/tips/:id/delete', adminController.tipDelete);

router.post('/uploads/tip-image', upload.single('image'), adminController.tipImageUpload);

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
