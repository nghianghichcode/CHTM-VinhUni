const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');
const { asyncHandler } = require('../middlewares/asyncHandler');

router.get('/', asyncHandler(mainController.home));
router.get('/faq', mainController.faq);
router.get('/contact', mainController.contact);
router.post('/contact', asyncHandler(mainController.contactPost));
router.post('/rescue-request', asyncHandler(mainController.rescueRequestPost));

module.exports = router;
