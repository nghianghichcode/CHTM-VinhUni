const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { ensureAdmin, ensureGuest } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/asyncHandler');

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
router.post('/login', ensureGuest, asyncHandler(adminController.login));

router.use(ensureAdmin);

router.get('/', asyncHandler(adminController.dashboard));

// Tips
router.get('/tips', asyncHandler(adminController.tips));
router.get('/tips/new', asyncHandler(adminController.tipForm));
router.get('/tips/:id/edit', asyncHandler(adminController.tipForm));
router.post('/tips/save', upload.single('thumbnailFile'), asyncHandler(adminController.tipSave));
router.post('/tips/:id/delete', asyncHandler(adminController.tipDelete));

router.post('/uploads/tip-image', upload.single('image'), asyncHandler(adminController.tipImageUpload));

// Categories
router.get('/categories', asyncHandler(adminController.categories));
router.post('/categories/save', asyncHandler(adminController.categorySave));
router.post('/categories/:id/delete', asyncHandler(adminController.categoryDelete));

// Tags
router.get('/tags', asyncHandler(adminController.tags));
router.post('/tags/save', asyncHandler(adminController.tagSave));
router.post('/tags/:id/delete', asyncHandler(adminController.tagDelete));

// Tickets
router.get('/tickets', asyncHandler(adminController.tickets));
router.get('/tickets/:id', asyncHandler(adminController.ticketDetail));
router.post('/tickets/:id/update', asyncHandler(adminController.ticketUpdate));

// Contacts
router.get('/contacts', asyncHandler(adminController.contacts));

module.exports = router;
