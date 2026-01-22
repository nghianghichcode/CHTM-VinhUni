const express = require('express');
const router = express.Router();
const mainController = require('../controllers/mainController');

router.get('/', mainController.home);
router.get('/faq', mainController.faq);
router.get('/contact', mainController.contact);
router.post('/contact', mainController.contactPost);

module.exports = router;
